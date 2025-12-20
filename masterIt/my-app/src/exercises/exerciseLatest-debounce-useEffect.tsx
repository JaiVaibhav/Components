import React, { useEffect, useState, useRef } from "react";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const abortControllerRef = useRef<AbortController | null>(null)
  const [loading, setLoading] = useState(false);
  async function fetchSearch(q) {
    let abortController;
    try {
       if(abortControllerRef.current)
    {
       abortControllerRef.current?.abort();
       abortControllerRef.current = null;
    }
    setLoading(true);
    abortController = new AbortController();
    abortControllerRef.current = abortController;
    const res = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(q)}`, {signal:abortControllerRef.current.signal});
    const data = await res.json();
    if(abortController === abortControllerRef.current)
    setResults(data.products || []);
    } catch (error:any) {
       if (error.name === "AbortError") {
        // expected when aborted — do nothing
        return;
      }

    }
    finally {
      setLoading(false);
      if(abortControllerRef.current === abortController )
      abortController.abort();
    abortControllerRef.current = null;
    }
   
  }

  useEffect(()=>{
    const timer= setTimeout(() => {
      if(query.length>=3)
      fetchSearch(query);
    }, 300);
    return ()=>{
      if(abortControllerRef.current)
      {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      }
     
      clearTimeout(timer);
    }
  },[query])

  function handleChange(e) {
    setQuery(e.target.value);
  }

  return (
    <div>
      <input 
        placeholder="Search products..."
        value={query}
        onChange={handleChange}
      />

     {
      loading?<span>Loading...</span>:<ul>
        {results.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
     } 
    </div>
  );
}
