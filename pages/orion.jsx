import { useState } from "react";
const UI = { bg:"#0B0F1A", panel:"#0F1629", text:"#E8EEFF", muted:"#9BB0D3", error:"#FF6B6B", gradient:"linear-gradient(135deg,#8B5CF6 0%,#22D3EE 100%)", radius:16 };
function Button({children,onClick,disabled}){return <button onClick={onClick} disabled={disabled} style={{padding:"10px 14px",borderRadius:12,border:"none",color:"#08131D",backgroundImage:UI.gradient,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.6:1,fontWeight:600}}>{children}</button>}

export default function Orion(){
  const [step,setStep]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const [product,setProduct]=useState(""),[industry,setIndustry]=useState("Beauty"),[goal,setGoal]=useState("Awareness"),[tone,setTone]=useState("Elegant"),[platform,setPlatform]=useState("Instagram Reel 9:16"),[needVoice,setNeedVoice]=useState(true),[notes,setNotes]=useState("");
  const [copy,setCopy]=useState(null),[imageUrl,setImageUrl]=useState(""),[audioUrl,setAudioUrl]=useState(""),[videoJob,setVideoJob]=useState(null),[status,setStatus]=useState(null);
  const formatMap={"Instagram Reel 9:16":"reel_video","Instagram Feed 1:1":"square_video","YouTube 16:9":"wide_video"};
  async function call(p,b,m="POST"){const r=await fetch(p,{method:m,headers:{"Content-Type":"application/json"},body:m==="POST"?JSON.stringify(b||{}):undefined});if(!r.ok)throw new Error(await r.text());return r.json();}
  async function next(){setError("");try{
    if(step===0){if(!product.trim())return setError("Tell me the product/brand first.");setStep(1);}
    else if(step===1){setBusy(true);const composed=await call("/api/compose",{product,industry,goal,tone,platform,needVoice,notes});setCopy(composed);setBusy(false);setStep(2);}
    else if(step===2){setBusy(true);const basePrompt=`${product}, ${industry.toLowerCase()} brand, ${tone.toLowerCase()} style, for ${platform}, goal: ${goal.toLowerCase()}. ${copy?.headline?("Headline overlay: "+copy.headline):""} High quality product shot.`;const img=await call("/api/render",{prompt:basePrompt});setImageUrl(img.url);setBusy(false);setStep(3);}
    else if(step===3){if(needVoice && copy?.script){setBusy(true);const tts=await call("/api/tts",{text:copy.script,voice:"alloy"});setAudioUrl(tts.audioDataUrl);setBusy(false);}setStep(4);}
    else if(step===4){setBusy(true);const fmt=formatMap[platform]||"square_video";const payload={title:copy?.headline||product,imageUrl,format:fmt};if(audioUrl.startsWith("https://"))payload.audioUrl=audioUrl;const job=await call("/api/renderVideo",payload);setVideoJob(job);setBusy(false);const t=setInterval(async()=>{try{const s=await call(`/api/status?id=${encodeURIComponent(job.id)}`,null,"GET");setStatus(s);if(s.status==="done")clearInterval(t);}catch{}},4000);setStep(5);}
  }catch(e){setBusy(false);setError(e.message);}}
  return (<main style={{minHeight:"100vh",background:UI.bg,color:UI.text,padding:"24px",fontFamily:"Inter,system-ui"}}><header style={{marginBottom:12}}><h1 style={{margin:0,fontSize:28}}>Orion — AI Social Media Agent</h1><p style={{margin:"6px 0",color:UI.muted}}>Chat to produce a complete post: media + caption + hashtags {needVoice?"+ optional voiceover":""}</p></header>
  <div style={{maxWidth:900,margin:"0 auto",background:UI.panel,borderRadius:16,padding:16,border:"1px solid rgba(255,255,255,0.06)"}}>
  {step===0&&(<div><div style={{marginBottom:8}}>What product or brand are we promoting today?</div><input value={product} onChange={e=>setProduct(e.target.value)} style={{width:"100%",background:"#0C1426",color:UI.text,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",padding:"8px"}}/><div style={{marginTop:8}}><Button onClick={next}>Next</Button></div></div>)}
  {step===1&&(<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
    <div><label style={{color:UI.muted}}>Industry</label><select value={industry} onChange={e=>setIndustry(e.target.value)} style={{width:"100%",background:"#0C1426",color:UI.text,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",padding:"8px"}}><option>Beauty</option><option>Tech</option><option>Fitness</option><option>Food</option><option>Real Estate</option><option>Fashion</option><option>Education</option></select></div>
    <div><label style={{color:UI.muted}}>Goal</label><select value={goal} onChange={e=>setGoal(e.target.value)} style={{width:"100%",background:"#0C1426",color:UI.text,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",padding:"8px"}}><option>Awareness</option><option>Conversion</option><option>Engagement</option><option>Tutorial</option></select></div>
    <div><label style={{color:UI.muted}}>Tone</label><select value={tone} onChange={e=>setTone(e.target.value)} style={{width:"100%",background:"#0C1426",color:UI.text,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",padding:"8px"}}><option>Elegant</option><option>Bold</option><option>Friendly</option><option>Minimal</option><option>Energetic</option></select></div>
    <div><label style={{color:UI.muted}}>Platform</label><select value={platform} onChange={e=>setPlatform(e.target.value)} style={{width:"100%",background:"#0C1426",color:UI.text,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",padding:"8px"}}><option>Instagram Reel 9:16</option><option>Instagram Feed 1:1</option><option>YouTube 16:9</option></select></div>
    </div>
    <div style={{marginTop:8}}><label style={{color:UI.muted}}><input type="checkbox" checked={needVoice} onChange={e=>setNeedVoice(e.target.checked)} style={{marginRight:8}}/>Include a voiceover script & (optional) TTS</label></div>
    <div style={{marginTop:8}}><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Any extra notes, offer details, or constraints?" style={{width:"100%",background:"#0C1426",color:UI.text,borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",padding:"8px"}}/></div>
    <div style={{marginTop:8}}><Button onClick={next} disabled={busy}>{busy?"Thinking...":"Create copy"}</Button></div></div>)}
  {step===2&&(<div><div style={{marginBottom:8}}>Here's your copy. Shall I generate visuals?</div>
    <div style={{marginTop:8,background:"#0C1426",borderRadius:12,padding:12,border:"1px solid rgba(255,255,255,0.08)"}}>
      <div><b>Headline:</b> {copy?.headline}</div>
      <div style={{marginTop:6}}><b>Caption:</b> {copy?.caption}</div>
      <div style={{marginTop:6}}><b>Hashtags:</b> {Array.isArray(copy?.hashtags)?copy.hashtags.join(" "):""}</div>
      {copy?.script && <div style={{marginTop:6}}><b>Script:</b> {copy.script}</div>}
    </div>
    <div style={{marginTop:8}}><Button onClick={next} disabled={busy}>{busy?"Rendering...":"Generate image"}</Button></div></div>)}
  {step===3&&(<div><div>Visual ready. {needVoice?"Generate voiceover?":"Proceed to assembly?"}</div>{imageUrl && <div style={{marginTop:8,border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,overflow:"hidden"}}><img src={imageUrl} style={{display:"block",width:"100%"}}/></div>}<div style={{marginTop:8}}><Button onClick={next} disabled={busy}>{needVoice?"Generate voiceover":"Assemble video"}</Button></div></div>)}
  {step===4&&(<div><div>{audioUrl?"Voiceover ready (preview below). Assemble video?":"No audio attached. Assemble video?"}</div>{audioUrl && <div style={{marginTop:8}}><audio controls src={audioUrl}/></div>}<div style={{color:"#9BB0D3",marginTop:6,fontSize:12}}>Note: To include audio in the final render, paste a public https MP3 URL in a future version. For now, silent renders are supported.</div><div style={{marginTop:8}}><Button onClick={next} disabled={busy}>Assemble video</Button></div></div>)}
  {step===5&&(<div><div>Rendering... I’ll stream the status below.</div>{status && (<div style={{marginTop:12,background:"#0C1426",borderRadius:12,padding:12,border:"1px solid rgba(255,255,255,0.08)"}}><div><b>Status:</b> {status.status}</div>{status.hostedUrl && <div style={{marginTop:10}}><video controls src={status.hostedUrl} style={{maxWidth:"100%"}}/>}</div>)}</div>)}
  {error && <div style={{color:UI.error,marginTop:8}}>Error: {error}</div>}
  </div></main>);
}
