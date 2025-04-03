
export async function POST(req) {
    const { upc } = await req.json();
  
    const res = await fetch("https://api.upcitemdb.com/prod/trial/lookup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ upc })
    });
  
    const data = await res.json();
  
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  