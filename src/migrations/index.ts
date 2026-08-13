import * as migration_20241116_194708_migration from "./20241116_194708_migration";
import * as migration_20260813_120000_footer_brand_description from "./20260813_120000_footer_brand_description";

export const migrations = [
  {
    name: "20241116_194708_migration",
    down: migration_20241116_194708_migration.down,
    up: migration_20241116_194708_migration.up,
  },
  {
    name: "20260813_120000_footer_brand_description",
    down: migration_20260813_120000_footer_brand_description.down,
    up: migration_20260813_120000_footer_brand_description.up,
  },
];
