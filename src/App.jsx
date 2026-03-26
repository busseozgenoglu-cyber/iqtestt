import { useState, useEffect, useRef, useCallback } from "react";

/* ─── IQ HESAPLAMA ─── */
function calculateIQ(correct, total, timeMs) {
  const accuracy = correct / total;
  const timeSec = timeMs / 1000;
  const speedBonus = Math.max(0, 1 - timeSec / 600);
  const raw = accuracy * 0.75 + speedBonus * 0.25;
  const iq = Math.round(85 + raw * 60);
  return Math.min(145, Math.max(85, iq));
}

function getIQLabel(iq) {
  if (iq >= 140) return { label: "Üstün Zeka", color: "#7c3aed" };
  if (iq >= 130) return { label: "Çok Yüksek Zeka", color: "#2563eb" };
  if (iq >= 120) return { label: "Yüksek Zeka", color: "#0891b2" };
  if (iq >= 110) return { label: "Ortalamanın Üstü", color: "#16a34a" };
  if (iq >= 100) return { label: "Ortalama Zeka", color: "#22c55e" };
  return { label: "Gelişime Açık", color: "#f59e0b" };
}

function getPercentile(iq) {
  if (iq >= 140) return 99;
  if (iq >= 135) return 98;
  if (iq >= 130) return 97;
  if (iq >= 125) return 95;
  if (iq >= 120) return 91;
  if (iq >= 115) return 84;
  if (iq >= 110) return 75;
  if (iq >= 105) return 63;
  if (iq >= 100) return 50;
  if (iq >= 95)  return 37;
  return 25;
}

const NAMES = ["Ahmet","Mehmet","Ayşe","Fatma","Ali","Zeynep","Mustafa","Emine","Hasan","Hüseyin","Merve","Selin","Burak","Deniz","Tuğba","Emre","Elif","Ömer","Ceren","Kerem","Yasemin","Baran","İrem","Kaan","Ece","Berk","Nisa","Mert","Esra","Tolga","Defne","Onur"];

const INTERSTITIALS = [
  { title:<>Harika bir iş çıkardınız — <span style={{color:"#22c55e"}}>hızınız</span> etkileyici!</>, desc:"Hızlı düşünme, zorluklara uyum sağlamanıza, ayrıntıları daha çabuk fark etmenize yardımcı olur.", illustration:"brain-lightning" },
  { title:<><span style={{color:"#22c55e"}}>Şu ana kadar TR</span>'deki birçok kişiden <span style={{color:"#22c55e"}}>daha yüksek</span> puan aldınız</>, desc:"Performansınız; hızlı öğrenme, güçlü odaklanma ve zorluklara yeni yollarla yaklaşma becerinizi ortaya koyuyor.", illustration:"rocket" },
  { title:<>Olağanüstü <span style={{color:"#22c55e"}}>Mantık</span> puanı! 🧩</>, desc:"Güçlü mantık becerileri karmaşık problemleri çözmeyi kolaylaştırır.", illustration:"lightbulb" },
  { title:<>Dikkat seviyeniz <span style={{color:"#22c55e"}}>ortalamanın üstünde!</span></>, desc:"Yüksek dikkat seviyesi, detayları yakalamada büyük avantaj sağlar.", illustration:"target" },
  { title:<><span style={{color:"#22c55e"}}>Hafıza</span> kapasiteniz etkileyici!</>, desc:"Güçlü hafıza, bilgiyi hızlı işlemenize olanak tanır.", illustration:"memory" },
  { title:<>Analitik düşünce gücünüz <span style={{color:"#22c55e"}}>üst seviyede!</span></>, desc:"Verileri yorumlama yeteneğiniz güçlü problem çözme becerilerinizi gösteriyor.", illustration:"analytic" },
];

const STEPS = [
  { type:"q", title:"OTİZM Mİ YOKSA YÜKSEK IQ MU?", subtitle:"Alakasız olanı seç", qtype:"odd-one-out", options:[{id:"a",text:"I",italic:true},{id:"b",text:"I",italic:true},{id:"c",text:"I",italic:false},{id:"d",text:"I",italic:true},{id:"e",text:"I",italic:true},{id:"f",text:"I",italic:true},{id:"g",text:"I",italic:true},{id:"h",text:"I",italic:true}], correct:"c" },
  { type:"q", title:"Farklı olanı bul", subtitle:"Dikkat testi", qtype:"emoji-grid", items:["🔵","🔵","🔵","🔵","🔵","🟣","🔵","🔵","🔵","🔵","🔵","🔵"], options:[{id:"a",text:"2. sıra"},{id:"b",text:"6. sıra"},{id:"c",text:"9. sıra"},{id:"d",text:"4. sıra"}], correct:"b" },
  { type:"q", title:"Mantık bulmacası", subtitle:"Düşün ve cevapla", qtype:"text-choice", question:"Kapısı olmayan bir odaya nasıl girersiniz?", options:[{id:"a",text:"Pencereden"},{id:"b",text:"Çatıdan"},{id:"c",text:"Sözlükteki 'oda' kelimesine bakarak"},{id:"d",text:"Girilmez"}], correct:"c" },
  { type:"q", title:"Farklı olan şekli bulun", subtitle:"Görsel zeka", qtype:"shapes", options:[{id:"a",shape:"circle"},{id:"b",shape:"circle"},{id:"c",shape:"circle"},{id:"d",shape:"oval"}], correct:"d" },
  { type:"q", title:"Mantık bulmacası", subtitle:"Dikkatli oku!", qtype:"text-choice", question:"Bir çiftçinin 17 koyunu var. 9'u hariç hepsi öldü. Kaç koyun kaldı?", options:[{id:"a",text:"8"},{id:"b",text:"9"},{id:"c",text:"17"},{id:"d",text:"0"}], correct:"b" },
  { type:"inter", idx:0 },
  { type:"q", title:"Farklı emojyi bul", subtitle:"Görsel dikkat", qtype:"emoji-grid", items:["🟢","🟢","🟢","🟢","🟢","🟢","🟢","🟡","🟢","🟢","🟢","🟢"], options:[{id:"a",text:"4. sıra"},{id:"b",text:"8. sıra"},{id:"c",text:"1. sıra"},{id:"d",text:"12. sıra"}], correct:"b" },
  { type:"q", title:"Zeka sorusu", subtitle:"Hızlı düşün!", qtype:"text-choice", question:"Karanlık bir odaya girdiniz. Elinizde bir kibrit var. Odada mum, gaz lambası ve soba var. Önce hangisini yakarsınız?", options:[{id:"a",text:"Mumu"},{id:"b",text:"Gaz lambasını"},{id:"c",text:"Sobayı"},{id:"d",text:"Kibriti"}], correct:"d" },
  { type:"q", title:"Hangisi farklı?", subtitle:"Şekil analizi", qtype:"shapes", options:[{id:"a",shape:"circle"},{id:"b",shape:"circle"},{id:"c",shape:"oval"},{id:"d",shape:"circle"}], correct:"c" },
  { type:"q", title:"Mantık sorusu", subtitle:"İyi düşün!", qtype:"text-choice", question:"Hangi ayda 28 gün vardır?", options:[{id:"a",text:"Sadece Şubat"},{id:"b",text:"Hepsinde"},{id:"c",text:"Şubat ve Mart"},{id:"d",text:"Hiçbirinde"}], correct:"b" },
  { type:"inter", idx:1 },
  { type:"q", title:"Farklı olanı bul", subtitle:"Dikkat testi", qtype:"emoji-grid", items:["🔴","🔴","🔴","🔴","🔴","🔴","🟠","🔴","🔴","🔴","🔴","🔴"], options:[{id:"a",text:"3. sıra"},{id:"b",text:"7. sıra"},{id:"c",text:"10. sıra"},{id:"d",text:"1. sıra"}], correct:"b" },
  { type:"q", title:"Zeka sorusu", subtitle:"Dikkatli oku!", qtype:"text-choice", question:"Bir uçak Türkiye-Yunanistan sınırında düştü. Hayatta kalanlar nereye gömülür?", options:[{id:"a",text:"Türkiye'ye"},{id:"b",text:"Yunanistan'a"},{id:"c",text:"Hayatta kalanlar gömülmez"},{id:"d",text:"Sınıra"}], correct:"c" },
  { type:"q", title:"Farklı olan şekil", subtitle:"Görsel algı", qtype:"shapes", options:[{id:"a",shape:"oval"},{id:"b",shape:"circle"},{id:"c",shape:"circle"},{id:"d",shape:"circle"}], correct:"a" },
  { type:"q", title:"Kelime ilişkisi", subtitle:"Sözel zeka", qtype:"text-choice", question:"Kitap → Okumak :: Müzik → ?", options:[{id:"a",text:"Yazmak"},{id:"b",text:"Dinlemek"},{id:"c",text:"Çalmak"},{id:"d",text:"Nota"}], correct:"b" },
  { type:"inter", idx:2 },
  { type:"q", title:"Dikkat testi", subtitle:"Gizli emojyi bul", qtype:"emoji-grid", items:["⭐","⭐","⭐","⭐","⭐","⭐","⭐","⭐","🌟","⭐","⭐","⭐"], options:[{id:"a",text:"5. sıra"},{id:"b",text:"9. sıra"},{id:"c",text:"3. sıra"},{id:"d",text:"11. sıra"}], correct:"b" },
  { type:"q", title:"Mantık bulmacası", subtitle:"Klasik soru!", qtype:"text-choice", question:"Bir horozun günde 1 yumurtası olur. 7 günde kaç yumurta olur?", options:[{id:"a",text:"7"},{id:"b",text:"0"},{id:"c",text:"1"},{id:"d",text:"14"}], correct:"b" },
  { type:"q", title:"Hangisi farklı?", subtitle:"Şekil zekası", qtype:"shapes", options:[{id:"a",shape:"circle"},{id:"b",shape:"circle"},{id:"c",shape:"circle"},{id:"d",shape:"oval"}], correct:"d" },
  { type:"q", title:"Zeka sorusu", subtitle:"Pratik düşün!", qtype:"text-choice", question:"5 bardak var, 2'si dolu. En az kaç bardak hareket ettirerek dolu-boş-dolu-boş-dolu sıralama yapılır?", options:[{id:"a",text:"1"},{id:"b",text:"2"},{id:"c",text:"3"},{id:"d",text:"4"}], correct:"a" },
  { type:"inter", idx:3 },
  { type:"q", title:"Dikkat testi", subtitle:"Hızlı bul", qtype:"emoji-grid", items:["🍎","🍎","🍎","🍎","🍎","🍎","🍎","🍎","🍎","🍊","🍎","🍎"], options:[{id:"a",text:"3. sıra"},{id:"b",text:"6. sıra"},{id:"c",text:"10. sıra"},{id:"d",text:"12. sıra"}], correct:"c" },
  { type:"q", title:"Mantık sorusu", subtitle:"Hızlı düşün!", qtype:"text-choice", question:"Hangisi daha ağırdır: 1 kilo demir mi, 1 kilo pamuk mu?", options:[{id:"a",text:"Demir"},{id:"b",text:"Pamuk"},{id:"c",text:"İkisi de eşit"},{id:"d",text:"Belirlenemez"}], correct:"c" },
  { type:"q", title:"Uzamsal zeka", subtitle:"Katlandığında ne olur?", qtype:"spatial", options:[{id:"a",text:"Küp"},{id:"b",text:"Silindir"},{id:"c",text:"Piramit"},{id:"d",text:"Koni"}], correct:"a" },
  { type:"q", title:"Zeka sorusu", subtitle:"Düşün ve cevapla", qtype:"text-choice", question:"Bir adam 20. katta oturuyor. Her sabah asansörle 1. kata inip işe gidiyor. Akşam 15. kata çıkıp geri kalan 5 katı yürüyerek çıkıyor. Neden?", options:[{id:"a",text:"Egzersiz için"},{id:"b",text:"Boyu 15. kat düğmesine yettiği için"},{id:"c",text:"Asansör bozuk"},{id:"d",text:"Komşularıyla konuşmak için"}], correct:"b" },
  { type:"inter", idx:4 },
  { type:"q", title:"Gizli emojyi bul", subtitle:"Dikkat testi", qtype:"emoji-grid", items:["💎","💎","💎","💎","💎","💎","💎","💎","💎","💎","💎","💠"], options:[{id:"a",text:"4. sıra"},{id:"b",text:"8. sıra"},{id:"c",text:"12. sıra"},{id:"d",text:"1. sıra"}], correct:"c" },
  { type:"q", title:"Mantık bulmacası", subtitle:"Dikkatle oku!", qtype:"text-choice", question:"Bir baba ve oğlu kaza geçirir. Baba ölür. Oğlu hastaneye kaldırılır. Doktor 'Bu benim oğlum!' der. Bu nasıl mümkün?", options:[{id:"a",text:"Doktor üvey babası"},{id:"b",text:"Doktor annesi"},{id:"c",text:"Doktor dedesi"},{id:"d",text:"İmkansız"}], correct:"b" },
  { type:"q", title:"Farklı şekli seç", subtitle:"Görsel zeka", qtype:"shapes", options:[{id:"a",shape:"circle"},{id:"b",shape:"oval"},{id:"c",shape:"circle"},{id:"d",shape:"circle"}], correct:"b" },
  { type:"q", title:"Zeka sorusu", subtitle:"Son bulmacalar!", qtype:"text-choice", question:"3 anahtar 3 lambayı kontrol ediyor ama lambalar başka odada. Odaya sadece 1 kez gidebilirsiniz. Hangi anahtar hangi lamba?", options:[{id:"a",text:"Hepsini aç kapat"},{id:"b",text:"1'ini aç bekle, kapat, 2'yi aç, git: sıcak=1, açık=2, soğuk=3"},{id:"c",text:"İmkansız"},{id:"d",text:"Birini aç diğerlerini dene"}], correct:"b" },
  { type:"inter", idx:5 },
  { type:"q", title:"Farklı olanı bul", subtitle:"Son dikkat testi", qtype:"emoji-grid", items:["🌙","🌙","🌙","🌙","🌙","🌙","🌙","⭐","🌙","🌙","🌙","🌙"], options:[{id:"a",text:"2. sıra"},{id:"b",text:"5. sıra"},{id:"c",text:"8. sıra"},{id:"d",text:"11. sıra"}], correct:"c" },
  { type:"q", title:"İlişkiyi bul", subtitle:"Sözel zeka", qtype:"text-choice", question:"Göz → Görmek :: Kulak → ?", options:[{id:"a",text:"Duymak"},{id:"b",text:"Konuşmak"},{id:"c",text:"Dokunmak"},{id:"d",text:"Tatmak"}], correct:"a" },
  { type:"q", title:"Son mantık sorusu!", subtitle:"Düşün ve cevapla", qtype:"text-choice", question:"Bir köprü en fazla 100 kg taşır. 80 kg'lık bir adam, her biri 10 kg olan 3 karpuzla geçmek istiyor. Nasıl geçer?", options:[{id:"a",text:"Geçemez"},{id:"b",text:"Karpuzları havaya atarak jonglörlük yaparak"},{id:"c",text:"İkişer ikişer taşır"},{id:"d",text:"Karpuzları yuvarlar"}], correct:"b" },
  { type:"q", title:"Son soru!", subtitle:"Farklı şekli bul", qtype:"shapes", options:[{id:"a",shape:"circle"},{id:"b",shape:"circle"},{id:"c",shape:"oval"},{id:"d",shape:"circle"}], correct:"c" },
];

const TOTAL_STEPS = 36;

function Illustration({type}) {
  const base = {width:140,height:140,margin:"0 auto",position:"relative"};
  const circle = {width:120,height:120,borderRadius:"50%",background:"linear-gradient(135deg,#e8faf0,#d1fae5)",position:"absolute",top:10,left:10};
  const center = {position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:60};
  const icons = {
    "brain-lightning":<><div style={circle}/><div style={center}>🧠</div><div style={{position:"absolute",top:12,right:20,fontSize:40}}>⚡</div></>,
    "rocket":<><div style={circle}/><div style={center}>🚀</div></>,
    "lightbulb":<><div style={circle}/><div style={{...center,fontSize:70}}>🧑‍💼</div><div style={{position:"absolute",top:8,right:18,fontSize:44}}>💡</div></>,
    "target":<><div style={circle}/><div style={center}>🎯</div></>,
    "memory":<><div style={circle}/><div style={center}>🧠</div><div style={{position:"absolute",top:14,right:22,fontSize:20}}>💫</div></>,
    "analytic":<><div style={circle}/><div style={center}>🔮</div></>,
  };
  return <div style={base}>{icons[type]}</div>;
}

function SocialProofBar() {
  const [idx,setIdx]=useState(0);
  const data=useRef(NAMES.map(n=>({name:n,score:Math.floor(Math.random()*40)+82})));
  useEffect(()=>{const t=setInterval(()=>setIdx(i=>(i+1)%data.current.length),2800);return()=>clearInterval(t);},[]);
  const p=data.current[idx];
  return (
    <div style={{background:"#e8f5e9",padding:"10px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #c8e6c9"}}>
      <span>🇹🇷</span>
      <span style={{fontSize:13,color:"#333"}}><b>{p.name}</b> az önce IQ testinden <b>{p.score} puan</b> aldı!</span>
    </div>
  );
}

function TimerBar({onPayment}) {
  const [s,setS]=useState(579);
  useEffect(()=>{const t=setInterval(()=>setS(v=>Math.max(0,v-1)),1000);return()=>clearInterval(t);},[]);
  const mm=String(Math.floor(s/60)).padStart(2,"0"),ss=String(s%60).padStart(2,"0");
  return (
    <div style={{background:"#f5f5f5",padding:"8px 16px",display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1}}>
        <div style={{fontSize:11,color:"#666",marginBottom:2}}>%60 indirim sizi bekliyor:</div>
        <div style={{fontSize:32,fontWeight:800,color:"#111",letterSpacing:1,fontVariantNumeric:"tabular-nums"}}>{mm}:{ss}</div>
      </div>
      <button onClick={onPayment} style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:24,padding:"12px 22px",fontSize:15,fontWeight:700,cursor:"pointer"}}>IQ Raporunu Al</button>
    </div>
  );
}

function QuizHeader({stepIndex,startTime}) {
  const [elapsed,setElapsed]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setElapsed(Math.floor((Date.now()-startTime)/1000)),1000);return()=>clearInterval(t);},[startTime]);
  const mm=String(Math.floor(elapsed/60)).padStart(2,"0"),ss=String(elapsed%60).padStart(2,"0");
  const displayStep=Math.min(stepIndex+1,TOTAL_STEPS);
  const pct=(displayStep/TOTAL_STEPS)*100;
  return (
    <>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#fff"}}>
        <span style={{fontSize:20,cursor:"pointer",color:"#999"}}>←</span>
        <div style={{display:"flex",alignItems:"center",gap:5,background:"#f5f5f5",borderRadius:20,padding:"6px 14px"}}>
          <span style={{fontSize:13,color:"#999"}}>⏱</span>
          <span style={{fontSize:15,fontWeight:600,color:"#333",fontVariantNumeric:"tabular-nums"}}>{mm}:{ss}</span>
        </div>
        <span style={{fontSize:15,fontWeight:600,color:"#333"}}><span style={{color:"#22c55e"}}>{displayStep}</span>/{TOTAL_STEPS}</span>
      </div>
      <div style={{height:4,background:"#e5e7eb"}}><div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#22c55e,#16a34a)",transition:"width 0.4s"}}/></div>
    </>
  );
}

function Landing({onStart}) {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#e8d5f5 0%,#f5d5e8 35%,#d5d8f5 70%,#d5e5f5 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <h1 style={{fontSize:22,fontWeight:800,color:"#111",textAlign:"center",margin:"0 0 36px",lineHeight:1.3}}>OTİZM Mİ YOKSA YÜKSEK IQ MU?</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px 20px",marginBottom:28}}>
        {[0,1,2,3,4,5,6,7].map(i=>(
          <span key={i} style={{fontSize:60,fontFamily:"Georgia,'Times New Roman',serif",color:"#111",textAlign:"center",lineHeight:1,fontStyle:i===2?"normal":"italic",fontWeight:i===2?800:400}}>I</span>
        ))}
      </div>
      <p style={{fontSize:18,fontWeight:600,color:"#111",marginBottom:36,textAlign:"center"}}>Alakasız olanı seç</p>
      <button onClick={onStart} style={{background:"#111",color:"#fff",border:"none",borderRadius:28,padding:"16px 52px",fontSize:18,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 24px rgba(0,0,0,0.25)"}}>Testi yap</button>
      <div style={{marginTop:32,background:"rgba(0,0,0,0.07)",borderRadius:14,padding:"12px 20px",display:"flex",alignItems:"center",gap:10,maxWidth:320}}>
        <span style={{fontSize:22}}>🧠</span>
        <span style={{fontSize:14,color:"#333"}}>30 soruyu cevapla ve sonucunu öğren</span>
      </div>
    </div>
  );
}

function InterstitialCard({step,stepIndex,onContinue,startTime}) {
  const inter=INTERSTITIALS[step.idx];
  return (
    <div style={{minHeight:"100vh",background:"#f5f5f5",display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <QuizHeader stepIndex={stepIndex} startTime={startTime}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"24px 20px 40px"}}>
        <div style={{background:"#fff",borderRadius:20,padding:"32px 24px",textAlign:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <Illustration type={inter.illustration}/>
          <h2 style={{fontSize:20,fontWeight:700,color:"#111",margin:"20px 0 12px",lineHeight:1.4}}>{inter.title}</h2>
          <p style={{fontSize:14,color:"#888",lineHeight:1.7,margin:0}}>{inter.desc}</p>
          <button onClick={onContinue} style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:16,padding:"18px",fontSize:18,fontWeight:700,cursor:"pointer",width:"100%",marginTop:24}}>Devam →</button>
        </div>
      </div>
    </div>
  );
}

function QuizQuestion({step,stepIndex,onAnswer,startTime}) {
  const [sel,setSel]=useState(null);
  const [done,setDone]=useState(false);
  const pick=(id)=>{
    if(done)return; setSel(id); setDone(true);
    setTimeout(()=>{onAnswer(id===step.correct);setSel(null);setDone(false);},700);
  };
  const isC=(id)=>sel===id&&id===step.correct;
  const isW=(id)=>sel===id&&id!==step.correct;
  const bg=(id)=>isC(id)?"#22c55e":isW(id)?"#ef4444":"#fff";
  const fg=(id)=>sel===id?"#fff":"#111";
  return (
    <div style={{minHeight:"100vh",background:"#fff",display:"flex",flexDirection:"column"}}>
      <QuizHeader stepIndex={stepIndex} startTime={startTime}/>
      <h2 style={{fontSize:20,fontWeight:800,color:"#111",textAlign:"center",padding:"16px 20px 2px",margin:0}}>{step.title}</h2>
      <p style={{fontSize:14,color:"#999",textAlign:"center",margin:"0 0 20px"}}>{step.subtitle}</p>
      {step.qtype==="odd-one-out"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,padding:"0 20px"}}>
          {step.options.map(o=>(
            <button key={o.id} onClick={()=>pick(o.id)} style={{padding:"18px 0",fontSize:44,fontFamily:"Georgia,serif",fontStyle:o.italic?"italic":"normal",fontWeight:o.italic?400:800,border:"2px solid "+(sel===o.id?"transparent":"#e5e7eb"),borderRadius:12,cursor:"pointer",background:bg(o.id),color:fg(o.id),lineHeight:1,transition:"all 0.2s"}}>{o.text}</button>
          ))}
        </div>
      )}
      {step.qtype==="shapes"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,padding:"0 32px"}}>
          {step.options.map(o=>(
            <button key={o.id} onClick={()=>pick(o.id)} style={{padding:20,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid "+(sel===o.id?"transparent":"#e5e7eb"),borderRadius:16,cursor:"pointer",background:sel===o.id?(isC(o.id)?"#22c55e":"#ef4444"):"#f8f9fa",transition:"all 0.2s"}}>
              <div style={{width:o.shape==="oval"?44:56,height:56,borderRadius:"50%",background:sel===o.id?"#fff":"#6366f1"}}/>
            </button>
          ))}
        </div>
      )}
      {step.qtype==="text-choice"&&(
        <>
          <p style={{fontSize:16,color:"#111",textAlign:"center",padding:"0 24px",lineHeight:1.6,marginBottom:20}}>{step.question}</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,padding:"0 20px"}}>
            {step.options.map(o=>(
              <button key={o.id} onClick={()=>pick(o.id)} style={{padding:"14px 18px",fontSize:15,fontWeight:500,textAlign:"left",border:"2px solid "+(sel===o.id?"transparent":"#e5e7eb"),borderRadius:14,cursor:"pointer",background:bg(o.id),color:fg(o.id),transition:"all 0.2s"}}>{o.text}</button>
            ))}
          </div>
        </>
      )}
      {step.qtype==="emoji-grid"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:"0 40px",marginBottom:20}}>
            {step.items.map((e,i)=><span key={i} style={{fontSize:28,textAlign:"center"}}>{e}</span>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 20px"}}>
            {step.options.map(o=>(
              <button key={o.id} onClick={()=>pick(o.id)} style={{padding:14,fontSize:16,fontWeight:600,border:"2px solid "+(sel===o.id?"transparent":"#e5e7eb"),borderRadius:14,cursor:"pointer",background:bg(o.id),color:fg(o.id),transition:"all 0.2s"}}>{o.text}</button>
            ))}
          </div>
        </>
      )}
      {step.qtype==="spatial"&&(
        <>
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <svg width="160" height="130" viewBox="0 0 160 130">
              <rect x="20" y="5" width="40" height="40" fill="#e0e7ff" stroke="#818cf8" strokeWidth="2"/>
              <rect x="60" y="5" width="40" height="40" fill="#e0e7ff" stroke="#818cf8" strokeWidth="2"/>
              <rect x="20" y="45" width="40" height="40" fill="#e0e7ff" stroke="#818cf8" strokeWidth="2"/>
              <rect x="60" y="45" width="40" height="40" fill="#c7d2fe" stroke="#818cf8" strokeWidth="2"/>
              <rect x="100" y="45" width="40" height="40" fill="#e0e7ff" stroke="#818cf8" strokeWidth="2"/>
              <rect x="60" y="85" width="40" height="40" fill="#e0e7ff" stroke="#818cf8" strokeWidth="2"/>
            </svg>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,padding:"0 20px"}}>
            {step.options.map(o=>(
              <button key={o.id} onClick={()=>pick(o.id)} style={{padding:"14px 18px",fontSize:15,fontWeight:500,textAlign:"left",border:"2px solid "+(sel===o.id?"transparent":"#e5e7eb"),borderRadius:14,cursor:"pointer",background:bg(o.id),color:fg(o.id),transition:"all 0.2s"}}>{o.text}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Analyzing({onDone}) {
  const [p,setP]=useState(0);
  const phases=["Cevaplarınız analiz ediliyor...","Mantıksal düşünce kapasitesi hesaplanıyor...","Uzamsal zeka değerlendiriliyor...","IQ puanınız belirleniyor..."];
  useEffect(()=>{const t=setInterval(()=>setP(v=>{if(v>=100){clearInterval(t);setTimeout(onDone,400);return 100;}return v+1;}),45);return()=>clearInterval(t);},[onDone]);
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",background:"linear-gradient(180deg,#f0fdf4,#fff)"}}>
      <div style={{fontSize:72,marginBottom:20,animation:"pulse 1.2s ease-in-out infinite"}}>🧠</div>
      <h2 style={{fontSize:22,fontWeight:700,color:"#111",margin:"0 0 8px"}}>Sonuçlarınız Hazırlanıyor</h2>
      <p style={{fontSize:14,color:"#666",margin:"0 0 32px",textAlign:"center"}}>{phases[Math.min(Math.floor(p/25),3)]}</p>
      <div style={{width:"100%",maxWidth:280,height:8,background:"#e5e7eb",borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${p}%`,background:"linear-gradient(90deg,#22c55e,#16a34a)",borderRadius:4,transition:"width 0.05s linear"}}/>
      </div>
      <span style={{fontSize:14,color:"#888",marginTop:8,fontWeight:600}}>{p}%</span>
    </div>
  );
}

function PaymentModal({onClose,iq}) {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [phone,setPhone]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const handlePay=async()=>{
    if(!name||!email||!phone){setError("Tüm alanları doldurun.");return;}
    if(!/\S+@\S+\.\S+/.test(email)){setError("Geçerli bir e-posta giriniz.");return;}
    setLoading(true); setError("");
    try {
      const res=await fetch("/api/payment",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name,email,phone,iq})
      });
      const data=await res.json();
      if(data.token){
        window.location.href=`https://www.paytr.com/odeme/guvenli/${data.token}`;
      } else {
        setError(data.error||"Ödeme başlatılamadı.");
        setLoading(false);
      }
    } catch(e){
      setError("Bağlantı hatası. Tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#fff",borderRadius:"24px 24px 0 0",padding:"28px 24px 44px",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px rgba(0,0,0,0.2)"}}>
        <div style={{width:40,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 20px"}}/>
        <h2 style={{margin:"0 0 4px",fontSize:22,fontWeight:800,textAlign:"center"}}>IQ Raporunu Al</h2>
        <p style={{margin:"0 0 20px",fontSize:14,color:"#888",textAlign:"center"}}>Tek seferlik ödeme · Üyelik yok</p>

        <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:16,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:14,border:"1.5px solid #bbf7d0"}}>
          <div style={{fontSize:42}}>🧠</div>
          <div>
            <div style={{fontSize:26,fontWeight:900,color:"#16a34a",lineHeight:1}}>IQ {iq}</div>
            <div style={{fontSize:13,color:"#555",marginTop:2}}>Detaylı rapor anında gösterilecek</div>
          </div>
        </div>

        {[["Ad Soyad",name,setName,"text","Adınız Soyadınız"],["E-posta",email,setEmail,"email","ornek@gmail.com"],["Telefon",phone,setPhone,"tel","05XX XXX XX XX"]].map(([label,val,setter,type,ph])=>(
          <div key={label} style={{marginBottom:10}}>
            <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
              style={{width:"100%",padding:"13px 16px",borderRadius:12,border:"1.5px solid #e5e7eb",fontSize:15,outline:"none",boxSizing:"border-box"}}/>
          </div>
        ))}

        {error&&<p style={{color:"#ef4444",fontSize:13,margin:"0 0 10px",textAlign:"center"}}>{error}</p>}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"14px 0 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14,color:"#999",textDecoration:"line-through"}}>299 ₺</span>
            <span style={{fontSize:28,fontWeight:900,color:"#111"}}>58 ₺</span>
          </div>
          <div style={{background:"#fef3c7",borderRadius:8,padding:"5px 12px",fontSize:13,fontWeight:700,color:"#b45309"}}>TEK SEFERLİK</div>
        </div>

        <button onClick={handlePay} disabled={loading}
          style={{width:"100%",background:loading?"#9ca3af":"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:14,padding:"17px",fontSize:18,fontWeight:700,cursor:loading?"not-allowed":"pointer",boxShadow:"0 4px 16px rgba(34,197,94,0.3)",marginBottom:12}}>
          {loading?"Yönlendiriliyor...":"🔒 Güvenli Öde — 58 ₺"}
        </button>
        <p style={{fontSize:12,color:"#aaa",textAlign:"center",margin:0}}>256-bit SSL şifreleme · Anında sonuç · Tekrar ücret alınmaz</p>
      </div>
    </div>
  );
}

/* ─── RESULTS (Ödeme öncesi — blurlu) ─── */
function Results({iq,correct,total}) {
  const [showPayment,setShowPayment]=useState(false);
  const {label,color}=getIQLabel(iq);
  const percentile=getPercentile(iq);

  return (
    <div style={{background:"#fff",minHeight:"100vh"}}>
      {showPayment&&<PaymentModal onClose={()=>setShowPayment(false)} iq={iq}/>}
      <SocialProofBar/>

      <div style={{padding:"24px 20px 40px"}}>
        <h1 style={{fontSize:24,fontWeight:800,color:"#111",textAlign:"center",margin:"0 0 6px"}}>🎉 Testiniz Tamamlandı!</h1>
        <p style={{fontSize:15,color:"#666",textAlign:"center",margin:"0 0 24px"}}>Sonucunuzu görmek için aşağıya bakın</p>

        {/* IQ Skoru — blurlu göster */}
        <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:24,padding:28,textAlign:"center",marginBottom:20,border:"2px solid #bbf7d0",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:15,color:"#666",marginBottom:4}}>IQ Puanınız</div>
          <div style={{fontSize:90,fontWeight:900,color,lineHeight:1,filter:"blur(12px)",userSelect:"none",margin:"0 0 8px"}}>{iq}</div>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
            <div style={{fontSize:36}}>🔒</div>
            <div style={{fontSize:15,fontWeight:700,color:"#111",marginTop:4}}>Sonucu görmek için ödeme yapın</div>
          </div>
          <div style={{display:"inline-block",background:color,color:"#fff",borderRadius:20,padding:"6px 18px",fontSize:14,fontWeight:700,filter:"blur(6px)"}}>{label}</div>
        </div>

        {/* İstatistikler */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
          {[
            {label:"Doğru Cevap",value:`${correct}/${total}`,icon:"✅"},
            {label:"Yüzdelik Dilim",value:`%${percentile}`,icon:"📊"},
            {label:"Zeka Seviyesi",value:"???",icon:"🧠",blur:true},
            {label:"Rapor",value:"Hazır",icon:"📋"},
          ].map((s,i)=>(
            <div key={i} style={{background:"#f9fafb",borderRadius:16,padding:"14px 16px",textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:18,fontWeight:800,color:"#111",filter:s.blur?"blur(6px)":undefined}}>{s.value}</div>
              <div style={{fontSize:12,color:"#888"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Karşılaştırma */}
        <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:28}}>
          <div style={{background:"#fff",border:"2px solid #e5e7eb",borderRadius:16,padding:"10px 8px",textAlign:"center",width:100}}>
            <div style={{fontSize:14,fontWeight:700,color:"#111"}}>IQ 114</div>
            <div style={{fontSize:36,margin:"8px 0"}}>👩</div>
            <div style={{fontSize:11,fontWeight:600,color:"#555"}}>Marilyn Monroe</div>
          </div>
          <div style={{background:"linear-gradient(180deg,#22c55e,#16a34a)",borderRadius:16,padding:"10px 8px",textAlign:"center",width:110,transform:"scale(1.06)",boxShadow:"0 4px 20px rgba(34,197,94,0.35)"}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>IQ ?</div>
            <div style={{fontSize:36,margin:"8px 0"}}>🧑‍💼</div>
            <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Siz</div>
          </div>
          <div style={{background:"#fff",border:"2px solid #e5e7eb",borderRadius:16,padding:"10px 8px",textAlign:"center",width:100}}>
            <div style={{fontSize:14,fontWeight:700,color:"#22c55e"}}>IQ 160</div>
            <div style={{fontSize:36,margin:"8px 0"}}>👨‍🔬</div>
            <div style={{fontSize:11,fontWeight:600,color:"#555"}}>Albert Einstein</div>
          </div>
        </div>

        {/* CTA */}
        <button onClick={()=>setShowPayment(true)}
          style={{display:"block",width:"100%",background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:18,padding:"20px",fontSize:19,fontWeight:800,cursor:"pointer",boxShadow:"0 6px 24px rgba(34,197,94,0.35)",marginBottom:12}}>
          🔓 IQ Sonucumu Göster — 58 ₺
        </button>
        <p style={{fontSize:13,color:"#888",textAlign:"center",margin:"0 0 28px"}}>Tek seferlik ödeme · Üyelik yok · Anında sonuç</p>

        {/* Ne alacaksın */}
        <div style={{background:"#f9fafb",borderRadius:20,padding:"20px 18px",marginBottom:24}}>
          <h3 style={{fontSize:16,fontWeight:800,margin:"0 0 14px",color:"#111"}}>58 ₺ karşılığında ne alıyorsunuz?</h3>
          {[
            "✅ Kesin IQ puanınız (blur açılır)",
            "✅ Zeka kategoriniz ve seviyeniz",
            "✅ Türkiye geneli yüzdelik dilim karşılaştırması",
            "✅ Mantık, dikkat ve hafıza alt skorları",
            "✅ Kişiselleştirilmiş güçlü/zayıf yön analizi",
            "✅ Tekrar ücret alınmaz, üyelik yok",
          ].map((f,i)=>(
            <div key={i} style={{fontSize:14,color:"#333",lineHeight:1.7}}>{f}</div>
          ))}
        </div>

        {/* Güven */}
        <div style={{display:"flex",justifyContent:"center",gap:24,padding:"16px 0",borderTop:"1px solid #eee",marginBottom:24}}>
          {[["🔒","Güvenli Ödeme"],["💳","256-bit SSL"],["✅","Anında Sonuç"]].map(([ic,lb],i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:22}}>{ic}</span>
              <span style={{fontSize:11,color:"#888",fontWeight:600}}>{lb}</span>
            </div>
          ))}
        </div>

        {/* Yorumlar */}
        <h3 style={{fontSize:17,fontWeight:700,color:"#111",margin:"0 0 14px"}}>Kullanıcı Yorumları</h3>
        {[
          {name:"Selin K.",stars:5,text:"Çok detaylı bir analiz. IQ puanımı öğrenmek harika hissettirdi!"},
          {name:"Emre Y.",stars:5,text:"Sorular gerçekten eğlenceliydi. 58₺ için kesinlikle değer."},
          {name:"Ayşe D.",stars:4,text:"Hızlı ve güvenilir. Rapor anında geldi."},
        ].map((r,i)=>(
          <div key={i} style={{background:"#f9fafb",borderRadius:14,padding:"14px 16px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:14,fontWeight:600,color:"#111"}}>{r.name}</span>
              <span style={{fontSize:13}}>{"⭐".repeat(r.stars)}</span>
            </div>
            <p style={{fontSize:13,color:"#555",lineHeight:1.5,margin:0}}>{r.text}</p>
          </div>
        ))}

        <div style={{borderTop:"1px solid #eee",padding:"20px 0",textAlign:"center",marginTop:20}}>
          <p style={{fontSize:11,color:"#bbb",margin:0}}>Copyright © 2025 Testora IQ</p>
        </div>
      </div>
    </div>
  );
}

/* ─── ÖDEME BAŞARILI SAYFASI ─── */
function OdemeBasarili() {
  const params = new URLSearchParams(window.location.search);
  const iq = parseInt(params.get("iq")) || 105;
  const name = params.get("name") || "";
  const {label, color} = getIQLabel(iq);
  const percentile = getPercentile(iq);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0fdf4,#fff)",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 24px",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      <div style={{fontSize:64,marginBottom:16}}>🎉</div>
      <h1 style={{fontSize:26,fontWeight:900,color:"#111",textAlign:"center",margin:"0 0 8px"}}>Ödeme Onaylandı!</h1>
      {name && <p style={{fontSize:16,color:"#555",margin:"0 0 32px"}}>Tebrikler, <b>{name}</b>!</p>}

      {/* IQ Kutusu */}
      <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRadius:24,padding:32,textAlign:"center",marginBottom:24,border:"2px solid #bbf7d0",width:"100%",maxWidth:380}}>
        <div style={{fontSize:15,color:"#666",marginBottom:4}}>IQ Puanınız</div>
        <div style={{fontSize:96,fontWeight:900,color,lineHeight:1,margin:"0 0 8px"}}>{iq}</div>
        <div style={{display:"inline-block",background:color,color:"#fff",borderRadius:20,padding:"6px 20px",fontSize:15,fontWeight:700}}>{label}</div>
      </div>

      {/* İstatistikler */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24,width:"100%",maxWidth:380}}>
        {[
          {label:"Yüzdelik Dilim",value:`%${percentile}`,icon:"📊"},
          {label:"Zeka Seviyesi",value:label,icon:"🧠"},
          {label:"Durum",value:"Tamamlandı",icon:"✅"},
          {label:"Rapor",value:"Hazır",icon:"📋"},
        ].map((s,i)=>(
          <div key={i} style={{background:"#f9fafb",borderRadius:16,padding:"14px 16px",textAlign:"center"}}>
            <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:16,fontWeight:800,color:"#111"}}>{s.value}</div>
            <div style={{fontSize:12,color:"#888"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Analiz */}
      <div style={{background:"#fff",borderRadius:20,padding:"20px 18px",border:"1px solid #e5e7eb",width:"100%",maxWidth:380,marginBottom:24}}>
        <h3 style={{fontSize:16,fontWeight:800,margin:"0 0 14px",color:"#111"}}>Kişisel Analiz</h3>
        {iq >= 120 ? (
          <p style={{fontSize:14,color:"#555",lineHeight:1.7,margin:0}}>Zeka puanınız <b style={{color}}>üst %{100-percentile}</b>'lik dilimde yer alıyor. Güçlü mantık, analitik düşünce ve hızlı problem çözme becerileriniz öne çıkıyor.</p>
        ) : iq >= 110 ? (
          <p style={{fontSize:14,color:"#555",lineHeight:1.7,margin:0}}>Ortalamanın üstünde bir IQ'ya sahipsiniz. Türkiye genelinin <b style={{color}}>%{percentile}</b>'inden daha iyi bir performans sergilediniZ.</p>
        ) : (
          <p style={{fontSize:14,color:"#555",lineHeight:1.7,margin:0}}>Türkiye genelinin <b style={{color}}>%{percentile}</b>'inden daha iyi performans sergilediniZ. Düzenli zihinsel egzersizlerle puanınızı artırabilirsiniz.</p>
        )}
      </div>

      <button onClick={()=>window.location.href="/"} style={{background:"#111",color:"#fff",border:"none",borderRadius:14,padding:"16px 40px",fontSize:16,fontWeight:700,cursor:"pointer"}}>
        Ana Sayfaya Dön
      </button>
      <p style={{fontSize:11,color:"#bbb",margin:"20px 0 0",textAlign:"center"}}>Copyright © 2025 Testora IQ</p>
    </div>
  );
}

export default function App() {
  // URL kontrolü — /odeme-basarili sayfası
  if (window.location.pathname === "/odeme-basarili") {
    return <OdemeBasarili />;
  }

  const [page,setPage]=useState("landing");
  const [si,setSi]=useState(0);
  const [correct,setCorrect]=useState(0);
  const [startTime]=useState(Date.now());
  const [iqScore,setIqScore]=useState(null);
  const totalQ=STEPS.filter(s=>s.type==="q").length;

  const handleAnswer=useCallback((ok)=>{
    const newCorrect=ok?correct+1:correct;
    setSi(i=>{
      if(i+1>=STEPS.length){
        const elapsed=Date.now()-startTime;
        setIqScore(calculateIQ(newCorrect,totalQ,elapsed));
        setPage("analyzing");
        return i;
      }
      return i+1;
    });
    if(ok) setCorrect(c=>c+1);
  },[correct,startTime,totalQ]);

  const advance=useCallback(()=>{
    setSi(i=>{
      if(i+1>=STEPS.length){setPage("analyzing");return i;}
      return i+1;
    });
  },[]);

  const step=STEPS[si];
  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:"#fff",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",boxShadow:"0 0 40px rgba(0,0,0,0.08)"}}>
      {page==="landing"&&<Landing onStart={()=>setPage("quiz")}/>}
      {page==="quiz"&&step&&step.type==="inter"&&<InterstitialCard step={step} stepIndex={si} onContinue={advance} startTime={startTime}/>}
      {page==="quiz"&&step&&step.type==="q"&&<QuizQuestion step={step} stepIndex={si} onAnswer={handleAnswer} startTime={startTime}/>}
      {page==="analyzing"&&<Analyzing onDone={()=>setPage("results")}/>}
      {page==="results"&&<Results iq={iqScore||105} correct={correct} total={totalQ}/>}
    </div>
  );
}

if(typeof document!=="undefined"){
  const s=document.createElement("style");
  s.textContent=`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}button:active{transform:scale(0.97)!important}details summary::-webkit-details-marker{display:none}details summary{list-style:none}*{box-sizing:border-box}body{margin:0;padding:0;background:#f0f0f0}`;
  document.head.appendChild(s);
}
