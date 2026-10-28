const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (data, status=200) => new Response(JSON.stringify(data), {
  status, headers: {...cors, "Content-Type":"application/json; charset=utf-8"}
});
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null,{headers:cors});
    if (url.pathname === "/api/health" && request.method === "GET") return json({ok:true,service:"DeepSeek Chat API"});
    if (url.pathname !== "/api/chat") return json({error:"Маршрут не найден."},404);
    if (request.method !== "POST") return json({error:"Используй POST."},405);
    if (!env.DEEPSEEK_API_KEY) return json({error:"Не настроен секрет DEEPSEEK_API_KEY."},500);
    let body;
    try { body = await request.json(); } catch { return json({error:"Некорректный JSON."},400); }
    const allowed = new Set(["deepseek-chat","deepseek-reasoner"]);
    const model = allowed.has(body.model) ? body.model : "deepseek-chat";
    const messages = (Array.isArray(body.messages)?body.messages:[])
      .filter(m=>m&&["user","assistant"].includes(m.role)&&typeof m.content==="string")
      .slice(-30).map(m=>({role:m.role,content:m.content.slice(0,20000)}));
    if (!messages.length || !messages.some(m=>m.role==="user")) return json({error:"Добавь сообщение пользователя."},400);
    const system = typeof body.systemPrompt==="string" ? body.systemPrompt.slice(0,3000) : "";
    try {
      const upstream = await fetch("https://api.deepseek.com/chat/completions",{
        method:"POST",
        headers:{"Authorization":"Bearer "+env.DEEPSEEK_API_KEY,"Content-Type":"application/json"},
        body:JSON.stringify({model,messages:[{role:"system",content:system||"Ты полезный AI-ассистент. Отвечай на языке пользователя."},...messages],stream:false,max_tokens:4096})
      });
      const data = await upstream.json().catch(()=>({}));
      if (!upstream.ok) return json({error:data?.error?.message||data?.message||"DeepSeek API вернул статус "+upstream.status},upstream.status===429?429:502);
      const reply=data?.choices?.[0]?.message?.content;
      if(typeof reply!=="string")return json({error:"В ответе API нет текста."},502);
      return json({reply,model:data.model||model,usage:data.usage||null});
    } catch { return json({error:"Не удалось подключиться к DeepSeek API. Попробуй позже."},502); }
  }
};