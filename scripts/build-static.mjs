import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, compileScript, compileTemplate } from "vue/compiler-sfc";
import { rollup } from "rollup";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "src");
const distDir = path.join(root, "dist");
const shouldServe = process.argv.includes("--serve");
const port = Number(process.env.PORT || 5173);

function vuePlugin() {
  return {
    name: "vue-sfc-compiler",
    async transform(source, filename) {
      if (!filename.endsWith(".vue")) return null;
      const id = createHash("sha256").update(filename).digest("hex").slice(0, 8);
      const { descriptor, errors } = parse(source, { filename });
      if (errors.length) {
        throw new Error(errors.map((error) => error.message).join("\n"));
      }

      let scriptCode = "const __sfc__ = {};";
      let bindings = {};
      if (descriptor.script || descriptor.scriptSetup) {
        const script = compileScript(descriptor, { id, inlineTemplate: false });
        bindings = script.bindings;
        scriptCode = script.content.replace("export default", "const __sfc__ =");
      }

      const template = compileTemplate({
        source: descriptor.template?.content || "",
        filename,
        id,
        compilerOptions: {
          bindingMetadata: bindings,
        },
      });
      if (template.errors.length) {
        throw new Error(template.errors.map((error) => String(error)).join("\n"));
      }

      return {
        code: [
          scriptCode,
          template.code,
          "__sfc__.render = render;",
          `__sfc__.__file = ${JSON.stringify(path.relative(root, filename).replaceAll("\\", "/"))};`,
          "export default __sfc__;",
        ].join("\n"),
        map: null,
      };
    },
  };
}

function packageResolver() {
  return {
    name: "package-resolver",
    async resolveId(source) {
      if (source.startsWith(".") || path.isAbsolute(source) || source.startsWith("\0")) return null;
      const packageName = source.startsWith("@")
        ? source.split("/").slice(0, 2).join("/")
        : source.split("/")[0];
      const packageRoot = path.join(root, "node_modules", packageName);
      const packageJson = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
      if (source === packageName && packageJson.module) {
        return path.join(packageRoot, packageJson.module);
      }
      return fileURLToPath(import.meta.resolve(source));
    },
  };
}

function productionEnv() {
  return {
    name: "production-env",
    transform(code) {
      if (!code.includes("process.env.NODE_ENV")) return null;
      return {
        code: code.replaceAll("process.env.NODE_ENV", JSON.stringify("production")),
        map: null,
      };
    },
  };
}

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const bundle = await rollup({
    input: path.join(sourceDir, "main.js"),
    plugins: [packageResolver(), vuePlugin(), productionEnv()],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY") return;
      warn(warning);
    },
  });

  await bundle.write({
    file: path.join(distDir, "app.js"),
    format: "es",
    sourcemap: false,
  });
  await bundle.close();

  await cp(path.join(sourceDir, "styles.css"), path.join(distDir, "styles.css"));
  await cp(path.join(root, "public", "manifest.webmanifest"), path.join(distDir, "manifest.webmanifest"));
  await cp(path.join(root, "public", "favicon.svg"), path.join(distDir, "favicon.svg"));
  await writeFile(
    path.join(distDir, "index.html"),
    `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#07111f" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="description" content="观潮：真实 A 股行情、移动端模拟交易与组合分析应用" />
    <link rel="icon" href="./favicon.svg" type="image/svg+xml" />
    <link rel="manifest" href="./manifest.webmanifest" />
    <link rel="stylesheet" href="./styles.css" />
    <title>观潮 · A股行情与模拟交易</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./app.js"></script>
  </body>
</html>
`,
    "utf8",
  );
  console.log(`Built static app in ${distDir}`);
}

function contentType(filename) {
  const extension = path.extname(filename);
  return (
    {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".webmanifest": "application/manifest+json; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".svg": "image/svg+xml",
    }[extension] || "application/octet-stream"
  );
}

function serve() {
  const server = createServer(async (request, response) => {
    try {
      const requestPath = decodeURIComponent((request.url || "/").split("?")[0]);
      const normalized = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
      const filename = path.resolve(distDir, normalized);
      if (!filename.startsWith(distDir)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      const body = await readFile(filename);
      response.writeHead(200, {
        "Content-Type": contentType(filename),
        "Cache-Control": "no-cache",
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  server.listen(port, "0.0.0.0", () => {
    const addresses = Object.values(networkInterfaces())
      .flat()
      .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
      .map((entry) => `http://${entry.address}:${port}`);
    console.log(`Local:   http://localhost:${port}`);
    addresses.forEach((address) => console.log(`Mobile:  ${address}`));
    console.log("Keep this process running while presenting the app.");
  });
}

await build();
if (shouldServe) serve();
