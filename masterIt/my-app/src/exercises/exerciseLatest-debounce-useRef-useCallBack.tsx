import React, { useState, useRef, useEffect, useCallback } from "react";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerIdRef = useRef<number>(0)
  async function fetchSearch(q:string) {
    let controller;
    try{
      if(abortControllerRef.current)
      {
        abortControllerRef.current.abort();
      }
        controller = new AbortController();
        abortControllerRef.current = controller;
    setLoading(true);
    const res = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(q)}`, {signal: controller.signal});
    const data = await res.json();
    if(controller === abortControllerRef.current)
    setResults(data.products || []);
    }catch(e){
      if(e.name === "AbortError")
      {
        console.log("Fetch API call is Aborted");
      }else
      console.warn("Some Error Occurred", e);
    }
    finally{
      
      if(abortControllerRef.current === controller)
      {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  }

    const memoizedSearchFunc = useCallback((query:string)=>{
      clearTimeout(timerIdRef.current);
        timerIdRef.current = setTimeout(()=>{
          if(query.length>=3)
      fetchSearch(query);
    },750)
  },[])

  useEffect(()=>{
    return (()=>{
      clearTimeout(timerIdRef.current);
      if(abortControllerRef.current)
      {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
      }
    })
  },[])



  function handleChange(e) {
    setQuery(e.target.value);
    // ❌ Currently triggers API on every keystroke — bad.
    if (e.target.value.length < 3) {
    setResults([]);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    return;
  }
    memoizedSearchFunc(e.target.value)
  }

  return (
    <div>
      <input 
        placeholder="Search products..."
        value={query}
        onChange={handleChange}
      />

      {
        loading?"loading":<ul>
        {results.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
      }
    </div>
  );
}
