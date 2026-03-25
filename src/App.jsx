import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DATA ─── */
const NAMES = [
  "Ahmet","Mehmet","Ayşe","Fatma","Ali","Zeynep","Mustafa","Emine",
  "Hasan","Hüseyin","Merve","Selin","Burak","Deniz","Tuğba","Emre",
  "Elif","Ömer","Ceren","Kerem","Yasemin","Baran","İrem","Kaan",
  "Ece","Berk","Nisa","Mert","Esra","Tolga","Defne","Onur"
];

const INTERSTITIALS = [
  {
    title:<>Harika bir iş çıkardınız — <span style={{color:"#22c55e"}}>hızınız</span> etkileyici!</>,
    desc:"Hızlı düşünme, zorluklara uyum sağlamanıza, ayrıntıları daha çabuk fark etmenize ve baskı altında kendinden emin kararlar vermenize yardımcı olur.",
    illustration:"brain-lightning"
  },
  {
    title:<><span style={{color:"#22c55e"}}>Şu ana kadar TR</span>'deki birçok kişiden <span style={{color:"#22c55e"}}>daha yüksek</span> puan aldınız</>,
    desc:"Performansınız; hızlı öğrenme, güçlü odaklanma ve zorluklara yeni yollarla yaklaşma becerinizi ortaya koyuyor.",
    illustration:"rocket"
  },
  {
    title:<>Olağanüstü <span style={{color:"#22c55e"}}>Mantık</span> puanı! 🧩</>,
    desc:"Güçlü mantık becerileri karmaşık problemleri çözmeyi ve her duruma net, eleştirel düşünceyle yaklaşmayı kolaylaştırır. Zorlu iş görevlerinden günlük kararlara kadar — bunların üstesinden kolaylıkla gelebilirsiniz.",
    illustration:"lightbulb"
  },
  {
    title:<>Dikkat seviyeniz <span style={{color:"#22c55e"}}>ortalamanın üstünde!</span></>,
    desc:"Yüksek dikkat seviyesi, detayları yakalamada ve hataları minimuma indirmede büyük avantaj sağlar. Bu yeteneğiniz günlük hayatta ve iş yaşamında fark yaratır.",
    illustration:"target"
  },
  {
    title:<><span style={{color:"#22c55e"}}>Hafıza</span> kapasiteniz etkileyici!</>,
    desc:"Güçlü hafıza, bilgiyi hızlı işlemenize ve karmaşık görevlerde üstün performans göstermenize olanak tanır.",
    illustration:"memory"
  },
  {
    title:<>Analitik düşünce gücünüz <span style={{color:"#22c55e"}}>üst seviyede!</span></>,
    desc:"Verileri yorumlama ve kalıpları tanıma yeteneğiniz, problem çözme becerilerinizin güçlü olduğunu gösteriyor.",
    illustration:"analytic"
  },
];

const STEPS = [
  // 1 — Odd one out (original)
  { type:"q", title:"OTİZM Mİ YOKSA YÜKSEK IQ MU?", subtitle:"Alakasız olanı seç", qtype:"odd-one-out",
    options:[{id:"a",text:"I",italic:true},{id:"b",text:"I",italic:true},{id:"c",text:"I",italic:false},{id:"d",text:"I",italic:true},{id:"e",text:"I",italic:true},{id:"f",text:"I",italic:true},{id:"g",text:"I",italic:true},{id:"h",text:"I",italic:true}], correct:"c" },
  // 2 — Emoji dikkat
  { type:"q", title:"Farklı olanı bul", subtitle:"Dikkat testi", qtype:"emoji-grid",
    items:["🔵","🔵","🔵","🔵","🔵","🟣","🔵","🔵","🔵","🔵","🔵","🔵"],
    options:[{id:"a",text:"2. sıra"},{id:"b",text:"6. sıra"},{id:"c",text:"9. sıra"},{id:"d",text:"4. sıra"}], correct:"b" },
  // 3 — Bulmaca: Oda
  { type:"q", title:"Mantık bulmacası", subtitle:"Düşün ve cevapla", qtype:"text-choice",
    question:"Kapısı olmayan bir odaya nasıl girersiniz?",
    options:[{id:"a",text:"Pencereden"},{id:"b",text:"Çatıdan"},{id:"c",text:"Sözlükteki 'oda' kelimesine bakarak"},{id:"d",text:"Girilmez"}], correct:"c" },
  // 4 — Şekil farklı
  { type:"q", title:"Farklı olan şekli bulun", subtitle:"Görsel zeka", qtype:"shapes",
    options:[{id:"a",shape:"circle"},{id:"b",shape:"circle"},{id:"c",shape:"circle"},{id:"d",shape:"oval"}], correct:"d" },
  // 5 — Bulmaca: Koyun
  { type:"q", title:"Mantık bulmacası", subtitle:"Dikkatli oku!", qtype:"text-choice",
    question:"Bir çiftçinin 17 koyunu var. 9'u hariç hepsi öldü. Kaç koyun kaldı?",
    options:[{id:"a",text:"8"},{id:"b",text:"9"},{id:"c",text:"17"},{id:"d",text:"0"}], correct:"b" },
  // interstitial 1
  { type:"inter", idx:0 },
  // 6 — Emoji dikkat 2
  { type:"q", title:"Farklı emojyi bul", subtitle:"Görsel dikkat", qtype:"emoji-grid",
    items:["🟢","🟢","🟢","🟢","🟢","🟢","🟢","🟡","🟢","🟢","🟢","🟢"],
    options:[{id:"a",text:"4. sıra"},{id:"b",text:"8. sıra"},{id:"c",text:"1. sıra"},{id:"d",text:"12. sıra"}], correct:"b" },
  // 7 — Bulmaca: Kibrit
  { type:"q", title:"Zeka sorusu", subtitle:"Hızlı düşün!", qtype:"text-choice",
    question:"Karanlık bir odaya girdiniz. Elinizde bir kibrit var. Odada mum, gaz lambası ve soba var. Önce hangisini yakarsınız?",
    options:[{id:"a",text:"Mumu"},{id:"b",text:"Gaz lambasını"},{id:"c",text:"Sobayı"},{id:"d",text:"Kibriti"}], correct:"d" },
  // 8 — Şekil farklı 2
  { type:"q", title:"Hangisi farklı?", subtitle:"Şekil analizi", qtype:"shapes",
    options:[{id:"a",shape:"circle"},{id:"b",shape:"circle"},{id:"c",shape:"oval"},{id:"d",shape:"circle"}], correct:"c" },
  // 9 — Bulmaca: Ay
  { type:"q", title:"Mantık sorusu", subtitle:"İyi düşün!", qtype:"text-choice",
    question:"Hangi ayda 28 gün vardır?",
    options:[{id:"a",text:"Sadece Şubat"},{id:"b",text:"Hepsinde"},{id:"c",text:"Şubat ve Mart"},{id:"d",text:"Hiçbirinde"}], correct:"b" },
  // interstitial 2
  { type:"inter", idx:1 },
  // 10 — Emoji dikkat 3
  { type:"q", title:"Farklı olanı bul", subtitle:"Dikkat testi", qtype:"emoji-grid",
    items:["🔴","🔴","🔴","🔴","🔴","🔴","🟠","🔴","🔴","🔴","🔴","🔴"],
    options:[{id:"a",text:"3. sıra"},{id:"b",text:"7. sıra"},{id:"c",text:"10. sıra"},{id:"d",text:"1. sıra"}], correct:"b" },
  // 11 — Bulmaca: Pilot
  { type:"q", title:"Zeka sorusu", subtitle:"Dikkatli oku!", qtype:"text-choice",
    question:"Bir uçak Türkiye-Yunanistan sınırında düştü. Hayatta kalanlar nereye gömülür?",
    options:[{id:"a",text:"Türkiye'ye"},{id:"b",text:"Yunanistan'a"},{id:"c",text:"Hayatta kalanlar gömülmez"},{id:"d",text:"Sınıra"}], correct:"c" },
  // 12 — Şekil farklı 3
  { type:"q", title:"Farklı olan şekil", subtitle:"Görsel algı", qtype:"shapes",
    options:[{id:"a",shape:"oval"},{id:"b",shape:"circle"},{id:"c",shape:"circle"},{id:"d",shape:"circle"}], correct:"a" },
  // 13 — Kelime analoji
  { type:"q", title:"Kelime ilişkisi", subtitle:"Sözel zeka", qtype:"text-choice",
    question:"Kitap → Okumak :: Müzik → ?", options:[{id:"a",text:"Yazmak"},{id:"b",text:"Dinlemek"},{id:"c",text:"Çalmak"},{id:"d",text:"Nota"}], correct:"b" },
  // interstitial 3
  { type:"inter", idx:2 },
  // 14 — Emoji dikkat 4
  { type:"q", title:"Dikkat testi", subtitle:"Gizli emojyi bul", qtype:"emoji-grid",
    items:["⭐","⭐","⭐","⭐","⭐","⭐","⭐","⭐","🌟","⭐","⭐","⭐"],
    options:[{id:"a",text:"5. sıra"},{id:"b",text:"9. sıra"},{id:"c",text:"3. sıra"},{id:"d",text:"11. sıra"}], correct:"b" },
  // 15 — Bulmaca: Tavuk-yumurta
  { type:"q", title:"Mantık bulmacası", subtitle:"Klasik soru!", qtype:"text-choice",
    question:"Bir horozun günde 1 yumurtası olur. 7 günde kaç yumurta olur?",
    options:[{id:"a",text:"7"},{id:"b",text:"0"},{id:"c",text:"1"},{id:"d",text:"14"}], correct:"b" },
  // 16 — Şekil farklı 4
  { type:"q", title:"Hangisi farklı?", subtitle:"Şekil zekası", qtype:"shapes",
    options:[{id:"a",shape:"circle"},{id:"b",shape:"circle"},{id:"c",shape:"circle"},{id:"d",shape:"oval"}], correct:"d" },
  // 17 — Bulmaca: Bardak
  { type:"q", title:"Zeka sorusu", subtitle:"Pratik düşün!", qtype:"text-choice",
    question:"5 bardak var, 2'si dolu. En az kaç bardak hareket ettirerek dolu-boş-dolu-boş-dolu sıralama yapılır?",
    options:[{id:"a",text:"1"},{id:"b",text:"2"},{id:"c",text:"3"},{id:"d",text:"4"}], correct:"a" },
  // interstitial 4
  { type:"inter", idx:3 },
  // 18 — Emoji dikkat 5
  { type:"q", title:"Dikkat testi", subtitle:"Hızlı bul", qtype:"emoji-grid",
    items:["🍎","🍎","🍎","🍎","🍎","🍎","🍎","🍎","🍎","🍊","🍎","🍎"],
    options:[{id:"a",text:"3. sıra"},{id:"b",text:"6. sıra"},{id:"c",text:"10. sıra"},{id:"d",text:"12. sıra"}], correct:"c" },
  // 19 — Bulmaca: Ağırlık
  { type:"q", title:"Mantık sorusu", subtitle:"Hızlı düşün!", qtype:"text-choice",
    question:"Hangisi daha ağırdır: 1 kilo demir mi, 1 kilo pamuk mu?",
    options:[{id:"a",text:"Demir"},{id:"b",text:"Pamuk"},{id:"c",text:"İkisi de eşit"},{id:"d",text:"Belirlenemez"}], correct:"c" },
  // 20 — Uzamsal zeka
  { type:"q", title:"Uzamsal zeka", subtitle:"Katlandığında ne olur?", qtype:"spatial",
    options:[{id:"a",text:"Küp"},{id:"b",text:"Silindir"},{id:"c",text:"Piramit"},{id:"d",text:"Koni"}], correct:"a" },
  // 21 — Bulmaca: Asansör
  { type:"q", title:"Zeka sorusu", subtitle:"Düşün ve cevapla", qtype:"text-choice",
    question:"Bir adam 20. katta oturuyor. Her sabah asansörle 1. kata inip işe gidiyor. Akşam 15. kata çıkıp geri kalan 5 katı yürüyerek çıkıyor. Neden?",
    options:[{id:"a",text:"Egzersiz için"},{id:"b",text:"Boyu 15. kat düğmesine yettiği için"},{id:"c",text:"Asansör bozuk"},{id:"d",text:"Komşularıyla konuşmak için"}], correct:"b" },
  // interstitial 5
  { type:"inter", idx:4 },
  // 22 — Emoji dikkat 6
  { type:"q", title:"Gizli emojyi bul", subtitle:"Dikkat testi", qtype:"emoji-grid",
    items:["💎","💎","💎","💎","💎","💎","💎","💎","💎","💎","💎","💠"],
    options:[{id:"a",text:"4. sıra"},{id:"b",text:"8. sıra"},{id:"c",text:"12. sıra"},{id:"d",text:"1. sıra"}], correct:"c" },
  // 23 — Bulmaca: Baba-oğul
  { type:"q", title:"Mantık bulmacası", subtitle:"Dikkatle oku!", qtype:"text-choice",
    question:"Bir baba ve oğlu kaza geçirir. Baba ölür. Oğlu hastaneye kaldırılır. Doktor 'Bu benim oğlum!' der. Bu nasıl mümkün?",
    options:[{id:"a",text:"Doktor üvey babası"},{id:"b",text:"Doktor annesi"},{id:"c",text:"Doktor dedesi"},{id:"d",text:"İmkansız"}], correct:"b" },
  // 24 — Şekil farklı 5
  { type:"q", title:"Farklı şekli seç", subtitle:"Görsel zeka", qtype:"shapes",
    options:[{id:"a",shape:"circle"},{id:"b",shape:"oval"},{id:"c",shape:"circle"},{id:"d",shape:"circle"}], correct:"b" },
  // 25 — Bulmaca: Elektrik
  { type:"q", title:"Zeka sorusu", subtitle:"Son bulmacalar!", qtype:"text-choice",
    question:"3 anahtar 3 lambayı kontrol ediyor ama lambalar başka odada. Odaya sadece 1 kez gidebilirsiniz. Hangi anahtar hangi lamba?",
    options:[{id:"a",text:"Hepsini aç kapat"},{id:"b",text:"1'ini aç bekle, kapat, 2'yi aç, git: sıcak=1, açık=2, soğuk=3"},{id:"c",text:"İmkansız"},{id:"d",text:"Birini aç diğerlerini dene"}], correct:"b" },
  // interstitial 6
  { type:"inter", idx:5 },
  // 26 — Emoji dikkat 7
  { type:"q", title:"Farklı olanı bul", subtitle:"Son dikkat testi", qtype:"emoji-grid",
    items:["🌙","🌙","🌙","🌙","🌙","🌙","🌙","⭐","🌙","🌙","🌙","🌙"],
    options:[{id:"a",text:"2. sıra"},{id:"b",text:"5. sıra"},{id:"c",text:"8. sıra"},{id:"d",text:"11. sıra"}], correct:"c" },
  // 27 — Analoji
  { type:"q", title:"İlişkiyi bul", subtitle:"Sözel zeka", qtype:"text-choice",
    question:"Göz → Görmek :: Kulak → ?",
    options:[{id:"a",text:"Duymak"},{id:"b",text:"Konuşmak"},{id:"c",text:"Dokunmak"},{id:"d",text:"Tatmak"}], correct:"a" },
  // 28 — Bulmaca: Köprü
  { type:"q", title:"Son mantık sorusu!", subtitle:"Düşün ve cevapla", qtype:"text-choice",
    question:"Bir köprü en fazla 100 kg taşır. 80 kg'lık bir adam, her biri 10 kg olan 3 karpuzla geçmek istiyor. Nasıl geçer?",
    options:[{id:"a",text:"Geçemez"},{id:"b",text:"Karpuzları havaya atarak jonglörlük yaparak"},{id:"c",text:"İkişer ikişer taşır"},{id:"d",text:"Karpuzları yuvarlar"}], correct:"b" },
  // 29 — Şekil farklı son
  { type:"q", title:"Son soru!", subtitle:"Farklı şekli bul", qtype:"shapes",
    options:[{id:"a",shape:"circle"},{id:"b",shape:"circle"},{id:"c",shape:"oval"},{id:"d",shape:"circle"}], correct:"c" },
];

const TOTAL_STEPS = 36;

/* ─── ILLUSTRATIONS ─── */
function Illustration({type}) {
  const base = {width:180,height:180,margin:"0 auto",position:"relative"};
  const circle = {width:160,height:160,borderRadius:"50%",background:"linear-gradient(135deg,#e8faf0,#d1fae5)",position:"absolute",top:10,left:10};
  const center = {position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:80};
  const icons = {
    "brain-lightning": <>
      <div style={circle}/><div style={center}>🧠</div>
      <div style={{position:"absolute",top:12,right:20,fontSize:40}}>⚡</div>
      <div style={{position:"absolute",bottom:28,left:22,fontSize:14,color:"#6366f1"}}>✦</div>
      <div style={{position:"absolute",bottom:32,right:28,fontSize:12,color:"#f59e0b"}}>✦</div>
    </>,
    "rocket": <>
      <div style={circle}/><div style={center}>🚀</div>
      <div style={{position:"absolute",top:22,left:28,fontSize:14,color:"#6366f1"}}>✦</div>
      <div style={{position:"absolute",top:30,right:32,fontSize:12,color:"#f59e0b"}}>✦</div>
    </>,
    "lightbulb": <>
      <div style={circle}/><div style={{...center,fontSize:70}}>🧑‍💼</div>
      <div style={{position:"absolute",top:8,right:18,fontSize:44}}>💡</div>
    </>,
    "target": <><div style={circle}/><div style={center}>🎯</div></>,
    "memory": <>
      <div style={circle}/><div style={center}>🧠</div>
      <div style={{position:"absolute",top:14,right:22,fontSize:20}}>💫</div>
    </>,
    "analytic": <>
      <div style={circle}/><div style={center}>🔮</div>
      <div style={{position:"absolute",bottom:26,left:22,fontSize:16}}>⭐</div>
    </>,
  };
  return <div style={base}>{icons[type]}</div>;
}

/* ─── SOCIAL PROOF BAR ─── */
function SocialProofBar() {
  const [idx, setIdx] = useState(0);
  const data = useRef(NAMES.map(n=>({name:n,score:Math.floor(Math.random()*40)+82})));
  useEffect(()=>{const t=setInterval(()=>setIdx(i=>(i+1)%data.current.length),2800);return()=>clearInterval(t);},[]);
  const p=data.current[idx];
  return (
    <div style={{background:"#e8f5e9",padding:"10px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #c8e6c9"}}>
      <span>🇹🇷</span>
      <span style={{fontSize:13,color:"#333"}}><b>{p.name}</b> az önce IQ testinden <b>{p.score} puan</b> aldı!</span>
    </div>
  );
}

/* ─── TIMER BAR ─── */
function TimerBar() {
  const [s,setS]=useState(579);
  useEffect(()=>{const t=setInterval(()=>setS(v=>Math.max(0,v-1)),1000);return()=>clearInterval(t);},[]);
  const mm=String(Math.floor(s/60)).padStart(2,"0"), ss=String(s%60).padStart(2,"0");
  return (
    <div style={{background:"#f5f5f5",padding:"8px 16px",display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1}}>
        <div style={{fontSize:11,color:"#666",marginBottom:2}}>%60 indirim sizi bekliyor:</div>
        <div style={{fontSize:32,fontWeight:800,color:"#111",letterSpacing:1,fontVariantNumeric:"tabular-nums"}}>{mm}:{ss}</div>
      </div>
      <button style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:24,padding:"12px 22px",fontSize:15,fontWeight:700,cursor:"pointer"}}>IQ Raporunu Al</button>
    </div>
  );
}

/* ─── QUIZ HEADER ─── */
function QuizHeader({stepIndex, startTime}) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(()=>{const t=setInterval(()=>setElapsed(Math.floor((Date.now()-startTime)/1000)),1000);return()=>clearInterval(t);},[startTime]);
  const mm=String(Math.floor(elapsed/60)).padStart(2,"0");
  const ss=String(elapsed%60).padStart(2,"0");
  const displayStep = Math.min(stepIndex+1, TOTAL_STEPS);
  const pct = (displayStep/TOTAL_STEPS)*100;
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

/* ─── LANDING ─── */
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

/* ─── INTERSTITIAL ─── */
function InterstitialCard({step, stepIndex, onContinue, startTime}) {
  const inter = INTERSTITIALS[step.idx];
  return (
    <div style={{minHeight:"100vh",background:"#f5f5f5",display:"flex",flexDirection:"column"}}>
      <QuizHeader stepIndex={stepIndex} startTime={startTime}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"24px 20px"}}>
        <div style={{background:"#fff",borderRadius:20,padding:"32px 24px",textAlign:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <Illustration type={inter.illustration}/>
          <h2 style={{fontSize:20,fontWeight:700,color:"#111",margin:"20px 0 12px",lineHeight:1.4}}>{inter.title}</h2>
          <p style={{fontSize:14,color:"#888",lineHeight:1.7,margin:0}}>{inter.desc}</p>
        </div>
        <button onClick={onContinue} style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:16,padding:"18px",fontSize:18,fontWeight:700,cursor:"pointer",width:"100%",marginTop:24}}>Devam</button>
      </div>
    </div>
  );
}

/* ─── QUIZ ─── */
function QuizQuestion({step, stepIndex, onAnswer, startTime}) {
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

      {step.qtype==="odd-one-out" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,padding:"0 20px"}}>
          {step.options.map(o=>(
            <button key={o.id} onClick={()=>pick(o.id)} style={{padding:"18px 0",fontSize:44,fontFamily:"Georgia,serif",fontStyle:o.italic?"italic":"normal",fontWeight:o.italic?400:800,border:"2px solid "+(sel===o.id?"transparent":"#e5e7eb"),borderRadius:12,cursor:"pointer",background:bg(o.id),color:fg(o.id),lineHeight:1,transition:"all 0.2s"}}>{o.text}</button>
          ))}
        </div>
      )}

      {step.qtype==="sequence" && (
        <>
          <div style={{display:"flex",justifyContent:"center",gap:8,padding:"0 16px",marginBottom:20,flexWrap:"wrap"}}>
            {step.display.map((v,i)=>(
              <span key={i} style={{width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:10,fontSize:18,fontWeight:700,background:v==="?"?"#22c55e":"#f0f0f0",color:v==="?"?"#fff":"#111"}}>{v}</span>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 20px"}}>
            {step.options.map(o=>(
              <button key={o.id} onClick={()=>pick(o.id)} style={{padding:14,fontSize:18,fontWeight:600,border:"2px solid "+(sel===o.id?"transparent":"#e5e7eb"),borderRadius:14,cursor:"pointer",background:bg(o.id),color:fg(o.id),transition:"all 0.2s"}}>{o.text}</button>
            ))}
          </div>
        </>
      )}

      {step.qtype==="shapes" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,padding:"0 32px"}}>
          {step.options.map(o=>(
            <button key={o.id} onClick={()=>pick(o.id)} style={{padding:20,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid "+(sel===o.id?"transparent":"#e5e7eb"),borderRadius:16,cursor:"pointer",background:sel===o.id?(isC(o.id)?"#22c55e":"#ef4444"):"#f8f9fa",transition:"all 0.2s"}}>
              <div style={{width:o.shape==="oval"?44:56,height:56,borderRadius:"50%",background:sel===o.id?"#fff":"#6366f1"}}/>
            </button>
          ))}
        </div>
      )}

      {step.qtype==="text-choice" && (
        <>
          <p style={{fontSize:16,color:"#111",textAlign:"center",padding:"0 24px",lineHeight:1.6,marginBottom:20}}>{step.question}</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,padding:"0 20px"}}>
            {step.options.map(o=>(
              <button key={o.id} onClick={()=>pick(o.id)} style={{padding:"14px 18px",fontSize:15,fontWeight:500,textAlign:"left",border:"2px solid "+(sel===o.id?"transparent":"#e5e7eb"),borderRadius:14,cursor:"pointer",background:bg(o.id),color:fg(o.id),transition:"all 0.2s"}}>{o.text}</button>
            ))}
          </div>
        </>
      )}

      {step.qtype==="grid" && (
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,padding:"0 60px",marginBottom:20}}>
            {step.grid.flat().map((c,i)=>(
              <div key={i} style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:c==="?"?800:600,borderRadius:8,background:c==="?"?"#22c55e":"#f0f4ff",color:c==="?"?"#fff":"#111"}}>{c}</div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 20px"}}>
            {step.options.map(o=>(
              <button key={o.id} onClick={()=>pick(o.id)} style={{padding:14,fontSize:18,fontWeight:600,border:"2px solid "+(sel===o.id?"transparent":"#e5e7eb"),borderRadius:14,cursor:"pointer",background:bg(o.id),color:fg(o.id),transition:"all 0.2s"}}>{o.text}</button>
            ))}
          </div>
        </>
      )}

      {step.qtype==="emoji-grid" && (
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

      {step.qtype==="spatial" && (
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

/* ─── ANALYZING ─── */
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

/* ─── RESULTS ─── */
function Results() {
  return (
    <div style={{background:"#fff",minHeight:"100vh"}}>
      <SocialProofBar/>
      <TimerBar/>
      <div style={{padding:"28px 20px"}}>
        <h1 style={{fontSize:26,fontWeight:800,color:"#111",textAlign:"center",margin:"0 0 4px"}}>IQ Sonuçlarınız Hazır!</h1>
        <p style={{fontSize:18,fontWeight:700,textAlign:"center",margin:"0 0 28px",lineHeight:1.4}}>
          <span style={{color:"#22c55e"}}>Nasıl Performans<br/>Gösterdiğinizi Görün!</span>
        </p>
        <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:28}}>
          <div style={{background:"#fff",border:"2px solid #e5e7eb",borderRadius:16,padding:"10px 8px",textAlign:"center",width:105}}>
            <div style={{fontSize:15,fontWeight:700,color:"#111"}}>IQ 114</div>
            <div style={{width:70,height:70,borderRadius:12,background:"#f3f4f6",margin:"8px auto",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:42}}>👩</span></div>
            <div style={{fontSize:11,fontWeight:600,color:"#555"}}>Marilyn Monroe</div>
          </div>
          <div style={{background:"linear-gradient(180deg,#22c55e,#16a34a)",borderRadius:16,padding:"10px 8px",textAlign:"center",width:105,transform:"scale(1.06)",boxShadow:"0 4px 20px rgba(34,197,94,0.35)"}}>
            <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>IQ ???</div>
            <div style={{width:70,height:70,borderRadius:12,background:"rgba(255,255,255,0.2)",margin:"8px auto",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:42}}>🧑‍💼</span></div>
            <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Siz</div>
          </div>
          <div style={{background:"#fff",border:"2px solid #e5e7eb",borderRadius:16,padding:"10px 8px",textAlign:"center",width:105}}>
            <div style={{fontSize:15,fontWeight:700,color:"#22c55e"}}>IQ 160</div>
            <div style={{width:70,height:70,borderRadius:12,background:"#f3f4f6",margin:"8px auto",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:42}}>👨‍🔬</span></div>
            <div style={{fontSize:11,fontWeight:600,color:"#555"}}>Albert Einstein</div>
          </div>
        </div>
        <button style={{display:"block",width:"100%",background:"#22c55e",color:"#fff",border:"none",borderRadius:16,padding:"18px",fontSize:18,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(34,197,94,0.3)",marginBottom:40}}>Tam IQ Raporunu İncele</button>

        <h2 style={{fontSize:22,fontWeight:800,color:"#111",textAlign:"center",margin:"0 0 20px",lineHeight:1.3}}>Testora IQ'yu <span style={{color:"#22c55e"}}>7 gün</span> boyunca deneyin</h2>
        <div style={{border:"2px solid #e5e7eb",borderRadius:20,padding:20,marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:"#111"}}>4 HAFTALIK PLAN</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                <span style={{fontSize:14,color:"#999",textDecoration:"line-through"}}>899,99 ₺</span>
                <span style={{color:"#999"}}>→</span>
                <span style={{fontSize:18,fontWeight:700,color:"#111"}}>59,99 ₺</span>
              </div>
            </div>
            <div style={{background:"#22c55e",borderRadius:14,padding:"10px 18px",textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:800,color:"#fff",lineHeight:1}}>₺8,57</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>günlük</div>
            </div>
          </div>
          {["Bilimsel olarak doğrulanmış testimizle gerçek IQ puanınızı keşfedin","Detaylı IQ analiz raporu alın","Bilişsel güçlü ve zayıf yönlerinizi öğrenin","Sınırsız IQ testi erişimi","Kişiselleştirilmiş beyin egzersizleri"].map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
              <span style={{color:"#22c55e",fontSize:18,flexShrink:0,lineHeight:1.3}}>✓</span>
              <span style={{fontSize:14,color:"#333",lineHeight:1.5}}>{f}</span>
            </div>
          ))}
          <button style={{display:"block",width:"100%",background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:14,padding:"16px",fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(34,197,94,0.25)",marginTop:8}}>Planı Başlat — 59,99 ₺</button>
          <p style={{fontSize:12,color:"#999",textAlign:"center",margin:"12px 0 0"}}>7 gün içinde istediğiniz zaman iptal edebilirsiniz</p>
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:28,padding:"16px 0",borderTop:"1px solid #eee"}}>
          {[["🔒","Güvenli Ödeme"],["💳","256-bit SSL"],["✅","İade Garantisi"]].map(([ic,lb],i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:22}}>{ic}</span>
              <span style={{fontSize:11,color:"#888",fontWeight:600}}>{lb}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop:28}}>
          <h3 style={{fontSize:17,fontWeight:700,color:"#111",margin:"0 0 14px"}}>Kullanıcı Yorumları</h3>
          {[{name:"Selin K.",stars:5,text:"Çok detaylı ve bilimsel bir analiz. IQ puanımı öğrenmek çok keyifli oldu!"},{name:"Emre Y.",stars:5,text:"Sorular gerçekten düşündürücü. Rapor son derece kapsamlı geldi."},{name:"Ayşe D.",stars:4,text:"Bilişsel güçlü yönlerimi öğrenmek kariyerimde yol gösterici oldu."}].map((r,i)=>(
            <div key={i} style={{background:"#f9fafb",borderRadius:14,padding:"14px 16px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:14,fontWeight:600,color:"#111"}}>{r.name}</span>
                <span style={{fontSize:13}}>{"⭐".repeat(r.stars)}</span>
              </div>
              <p style={{fontSize:13,color:"#555",lineHeight:1.5,margin:0}}>{r.text}</p>
            </div>
          ))}
        </div>

        <div style={{marginTop:28,paddingBottom:40}}>
          <h3 style={{fontSize:17,fontWeight:700,color:"#111",margin:"0 0 14px"}}>Sıkça Sorulan Sorular</h3>
          {[{q:"Test ne kadar sürer?",a:"Ortalama 10-15 dakika sürmektedir."},{q:"Sonuçlar ne kadar güvenilir?",a:"Bilimsel olarak doğrulanmış metodolojiler kullanılmaktadır."},{q:"İptal edebilir miyim?",a:"7 gün içinde ücretsiz iptal edebilirsiniz."},{q:"Ödeme güvenli mi?",a:"256-bit SSL şifreleme kullanılmaktadır."}].map((f,i)=>(
            <details key={i} style={{background:"#f9fafb",borderRadius:12,padding:"14px 16px",marginBottom:8,cursor:"pointer"}}>
              <summary style={{fontSize:14,fontWeight:600,color:"#111",listStyle:"none"}}>{f.q}</summary>
              <p style={{fontSize:13,color:"#666",lineHeight:1.5,margin:"10px 0 0"}}>{f.a}</p>
            </details>
          ))}
        </div>

        <div style={{borderTop:"1px solid #eee",padding:"20px 0",textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:8}}>
            {["Gizlilik Politikası","Kullanım Koşulları","Çerez Politikası"].map((t,i)=>(
              <a key={i} href="#" style={{fontSize:12,color:"#999",textDecoration:"none"}}>{t}</a>
            ))}
          </div>
          <p style={{fontSize:11,color:"#bbb",margin:0}}>Copyright © 2025</p>
        </div>
      </div>
    </div>
  );
}

/* ─── APP ─── */
export default function App() {
  const [page,setPage]=useState("landing");
  const [si,setSi]=useState(0);
  const [correct,setCorrect]=useState(0);
  const [startTime]=useState(Date.now());

  const advance=()=>{if(si+1>=STEPS.length)setPage("analyzing");else setSi(i=>i+1);};
  const handleAnswer=useCallback((ok)=>{if(ok)setCorrect(c=>c+1);advance();},[si]);

  const step=STEPS[si];
  return (
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:"#fff",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",boxShadow:"0 0 40px rgba(0,0,0,0.08)"}}>
      {page==="landing"&&<Landing onStart={()=>setPage("quiz")}/>}
      {page==="quiz"&&step.type==="inter"&&<InterstitialCard step={step} stepIndex={si} onContinue={advance} startTime={startTime}/>}
      {page==="quiz"&&step.type==="q"&&<QuizQuestion step={step} stepIndex={si} onAnswer={handleAnswer} startTime={startTime}/>}
      {page==="analyzing"&&<Analyzing onDone={()=>setPage("results")}/>}
      {page==="results"&&<Results/>}
    </div>
  );
}

if(typeof document!=="undefined"){
  const s=document.createElement("style");
  s.textContent=`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}button:active{transform:scale(0.97)!important}details summary::-webkit-details-marker{display:none}details summary{list-style:none}*{box-sizing:border-box}body{margin:0;padding:0;background:#f0f0f0}`;
  document.head.appendChild(s);
}
