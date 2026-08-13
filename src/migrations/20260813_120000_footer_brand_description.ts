import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-mongodb";

const footerGlobalQuery = {
  globalType: "footer",
};

export async function up({ payload, session }: MigrateUpArgs): Promise<void> {
  await payload.db.globals.collection.updateOne(
    footerGlobalQuery,
    [
      {
        $set: {
          "brand.description": {
            $ifNull: ["$brand.description", { $ifNull: ["$brand.slogan", "$brand.tagline"] }],
          },
        },
      },
      {
        $unset: ["brand.slogan", "brand.tagline"],
      },
    ],
    { session },
  );
}

export async function down({ payload, session }: MigrateDownArgs): Promise<void> {
  await payload.db.globals.collection.updateOne(
    footerGlobalQuery,
    [
      {
        $set: {
          "brand.tagline": {
            $ifNull: ["$brand.tagline", "$brand.description"],
          },
        },
      },
      {
        $unset: "brand.description",
      },
    ],
    { session },
  );
}
