import React, { useCallback, useEffect, useRef, useState } from "react";
type AnyFn = (...args: any[]) => void;

function useDebounce<T extends AnyFn>(callback:(...args:Parameters<T>)=>void, delay=500){
    const latestFuncRef = useRef(callback);
    const timerIdRef= useRef(0);
    latestFuncRef.current = callback;

    useEffect(() => {
  return () => {
    clearTimeout(timerIdRef.current);
  };
}, []);

    return useCallback((...args:Parameters<T>)=>{
        clearTimeout(timerIdRef.current);
         timerIdRef.current = setTimeout(()=>{
            latestFuncRef.current(...args);
        },delay);
    },[delay])
}

export default function SearchBox(){
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [productsList, setProductsList] = useState([]);

    const fetchItems = useCallback(
    async function(searchTextValue:string)
    {
        let controller;
        try{
        if(abortControllerRef.current)
            {
                abortControllerRef.current.abort();
            }

        setLoading(true);
        controller = new AbortController();
        abortControllerRef.current = controller;

        const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(searchTextValue)}`, {signal:controller.signal});
        const respData = (await response.json()).products;

        if(abortControllerRef.current === controller)
        setProductsList(respData);
        }
        catch(e)
        {
            if(e.name==="AbortError")
            {
                console.error("Fetch all is aborted");
            }
            else{
                 console.error("Some Error occured", e);
            }
        }
        finally{
            if(abortControllerRef.current === controller){
                abortControllerRef.current = null;
                setLoading(false);
            }
        }
    },[])

    useEffect(()=>{
        return(()=>{
            if(abortControllerRef.current)
            {
                abortControllerRef.current.abort();
                abortControllerRef.current=null;
            }
        })
    },[])


    const debouncedFunction = useDebounce(fetchItems, 500);

    function handleSearchChange(e)
    {   
        const {value} = e.target;
        setSearchText(value);
        if(value.length>3)
        debouncedFunction(value)
    }

    return <>
        <input type="text" value={searchText} onChange={handleSearchChange}/>

       {loading?"Loading...": <ul>
            {
                productsList.map((product)=>{
                    return <li key={product.id}>{product.title}</li>
                })
            }
        </ul>}
    </>
}