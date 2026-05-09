import { writeFileSync } from "fs";
import { resolve } from "path";

const SITE_URL = "https://magnmainstitute.netlify.app";

const staticRoutes = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/colleges", priority: 0.9, changefreq: "daily" },
  { path: "/courses", priority: 0.9, changefreq: "daily" },
  { path: "/blog", priority: 0.8, changefreq: "weekly" },
  { path: "/compare", priority: 0.7, changefreq: "weekly" },
  { path: "/login", priority: 0.3, changefreq: "monthly" },
  { path: "/signup", priority: 0.3, changefreq: "monthly" },
];

async function generateSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Fetch dynamic routes from Supabase
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: colleges } = await supabase.from("colleges").select("id, updated_at");
      if (colleges) {
        for (const college of colleges) {
          xml += `  <url>\n`;
          xml += `    <loc>${SITE_URL}/college/${college.id}</loc>\n`;
          xml += `    <lastmod>${(college.updated_at || new Date()).toISOString().split("T")[0]}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }
      }

      const { data: courses } = await supabase.from("courses").select("id, updated_at");
      if (courses) {
        for (const course of courses) {
          xml += `  <url>\n`;
          xml += `    <loc>${SITE_URL}/course/${course.id}</loc>\n`;
          xml += `    <lastmod>${(course.updated_at || new Date()).toISOString().split("T")[0]}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        }
      }

      const { data: posts } = await supabase.from("blog_posts").select("slug, updated_at").eq("published", true);
      if (posts) {
        for (const post of posts) {
          xml += `  <url>\n`;
          xml += `    <loc>${SITE_URL}/blog/${post.slug}</loc>\n`;
          xml += `    <lastmod>${(post.updated_at || new Date()).toISOString().split("T")[0]}</lastmod>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          xml += `  </url>\n`;
        }
      }
    }
  } catch (e) {
    console.warn("Could not fetch dynamic routes for sitemap:", e);
  }

  xml += `</urlset>\n`;

  const publicDir = resolve(process.cwd(), "public");
  writeFileSync(resolve(publicDir, "sitemap.xml"), xml);
  console.log("✅ Generated sitemap.xml");
}

function generateRobots() {
  const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login
Disallow: /signup

Sitemap: ${SITE_URL}/sitemap.xml
`;

  const publicDir = resolve(process.cwd(), "public");
  writeFileSync(resolve(publicDir, "robots.txt"), content);
  console.log("✅ Generated robots.txt");
}

async function main() {
  await generateSitemap();
  generateRobots();
}

main().catch(console.error);
