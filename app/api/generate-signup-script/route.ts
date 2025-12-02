import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';

type FieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file' | 'url';

type FormField = {
  id: number;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  labelColor: string;
  labelSize: string;
  labelWeight: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  bgColor: string;
  padding: string;
  fontSize: string;
  textColor: string;
};

function toMinifiedScript(fields: FormField[], containerId: string) {
  // Minified IIFE that fully replaces BC create account page with a loader and custom form
  const fieldsJson = JSON.stringify(fields);
  const escapedContainerId = JSON.stringify(containerId);
  const script =
    "(function(){function r(){try{var f=" + fieldsJson + ",c=" + escapedContainerId + ";var u=window.location;var p=u.pathname;var q=new URLSearchParams(u.search);var m=(p==='/login.php'&&q.get('action')==='create_account')||(p==='/login.php?action=create_account');if(!m)return;var d=document,b=d.body;var css='@keyframes cs-spin{to{transform:rotate(360deg)}}';var st=d.createElement('style');st.textContent=css;d.head&&d.head.appendChild(st);while(b.firstChild)b.removeChild(b.firstChild);b.style.background='#fff';b.style.margin='0';var L=d.createElement('div');L.id='custom-signup-loading';L.style.position='fixed';L.style.inset='0';L.style.background='#fff';L.style.display='flex';L.style.alignItems='center';L.style.justifyContent='center';L.style.zIndex='2147483647';var S=d.createElement('div');S.style.width='40px';S.style.height='40px';S.style.border='4px solid #e5e7eb';S.style.borderTopColor='#3b82f6';S.style.borderRadius='50%';S.style.animation='cs-spin 1s linear infinite';L.appendChild(S);b.appendChild(L);function a(e,s){for(var k in s){if(s[k]!=null){var v=s[k];var px=(k==='borderWidth'||k==='borderRadius'||k==='padding'||k==='fontSize')&&(typeof v==='number'||/^[0-9]+$/.test(v));e.style[k]=v+(px?'px':'');}}}var root=d.getElementById(c);if(!root){root=d.createElement('div');root.id=c;b.appendChild(root);}var wrap=d.createElement('div');wrap.id='custom-signup-form';wrap.style.maxWidth='640px';wrap.style.margin='24px auto';wrap.style.gap='12px';wrap.style.display='grid';wrap.style.padding='0 16px';var form=d.createElement('form');for(var i=0;i<f.length;i++){var field=f[i];var g=d.createElement('div');var label=d.createElement('label');label.textContent=field.label+(field.required?' *':'');a(label,{color:field.labelColor,fontSize:field.labelSize,fontWeight:field.labelWeight});label.style.display='block';label.style.marginBottom='6px';g.appendChild(label);var el;switch(field.type){case 'textarea':el=d.createElement('textarea');el.rows=3;break;case 'select':el=d.createElement('select');var opt=d.createElement('option');opt.textContent='Select an option';el.appendChild(opt);break;default:el=d.createElement('input');el.type=field.type;}el.placeholder=field.placeholder||'';a(el,{borderColor:field.borderColor,borderWidth:field.borderWidth,borderStyle:'solid',borderRadius:field.borderRadius,backgroundColor:field.bgColor,padding:field.padding,fontSize:field.fontSize,color:field.textColor});el.style.width='100%';el.style.outline='none';el.setAttribute('aria-label',field.label);if(field.required){el.setAttribute('required','true');}g.appendChild(el);form.appendChild(g);}wrap.appendChild(form);root.appendChild(wrap);b.removeChild(L);}catch(e){console&&console.error&&console.error('custom-signup error',e);}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',r);}else{r();}})();";
  return script;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fields: FormField[] = body?.formFields || [];
    const containerId: string = body?.containerId || 'custom-signup-container';
    if (!Array.isArray(fields)) {
      return NextResponse.json({ ok: false, error: 'Invalid formFields' }, { status: 400 });
    }
    const script = toMinifiedScript(fields, containerId);
    const outPath = path.join(process.cwd(), 'public', 'custom-signup.min.js');
    await writeFile(outPath, script, 'utf8');
    return NextResponse.json({ ok: true, path: '/custom-signup.min.js' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

