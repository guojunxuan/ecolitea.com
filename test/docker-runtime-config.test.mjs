import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("copies tsconfig.json into the production runner image", async () => {
  const dockerfile = await readFile(new URL("../Dockerfile", import.meta.url), "utf8");
  const runner = dockerfile.split("FROM base AS runner")[1];

  assert.ok(runner, "Dockerfile must define a runner stage");
  assert.match(
    runner,
    /COPY --from=builder --chown=ecolitea:ecolitea \/app\/tsconfig\.json \.\//,
  );
});
