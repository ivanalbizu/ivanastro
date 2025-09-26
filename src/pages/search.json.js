export async function GET() {
  // Get all blog posts 
  const posts = await import.meta.glob('../content/blog/*.mdx');
  
  const searchData = [];
  
  for (const path in posts) {
    const post = await posts[path]();
    
    searchData.push({
      title: post.frontmatter.title || 'Untitled',
      slug: post.frontmatter.slug,
      date: post.frontmatter.date || new Date().toISOString(),
      description: post.frontmatter.description || '',
      categories: post.frontmatter.categories || []
    });
  }
  
  // Sort by date (newest first)
  searchData.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return new Response(JSON.stringify(searchData), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}