import React, {useEffect, useState, useRef} from "react";


function useDebouncedValue(input:string, delay=500){
    const [data, setData] = useState(input);

    useEffect(()=>{
        const timer = setTimeout(()=>{
            setData(input);
        }, delay)

        return (()=>clearTimeout(timer))
    }, [input, delay]);

    return data;
}





export default function SearchBox(){
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [itemData, setItemData] = useState([]);

    async function fetchSearchData(searchText:any)
    {   
        setIsLoading(true);
        let controller;
        try {
            if(abortControllerRef.current)
            {
                abortControllerRef.current.abort();
            }
             controller = new AbortController();
            abortControllerRef.current = controller;
            const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(searchText)}`, {signal:controller.signal});
            const responseData = (await response.json()).products;
            console.log(responseData);
            if(abortControllerRef.current === controller)
            {
                setItemData(responseData);
            }

        } catch (error:any) {
            if(error.name === "AbortError")
            {
                console.log("Fetching is aborted");
                return;
            }
            console.warn("Some Error Occured");
        }finally{
            if(abortControllerRef.current === controller)
            {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        }
    }

    const debouncedText = useDebouncedValue(searchText);


    useEffect(()=>{
        return (()=>{
            if(abortControllerRef.current)
            {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        })
    },[])

    useEffect(()=>{
        if(debouncedText.length >= 3)
        {
            fetchSearchData(debouncedText);
        }
        else{
            setItemData([]);
        }
        
    },[debouncedText])
    function handleSearchChange(e){
            setSearchText(e.target.value);
            //fetchSearchData(e.target.value);
    }
        
    return <>
        <input value={searchText} placeholder="search" type="text" onChange={handleSearchChange}/>
        {
            isLoading?"Loading":<>
                <ul>
                     {
                     itemData.map((item)=>{
                        return<li key={item.id}>{item.title}</li>

                     })
                     }

                </ul>
        </>
}
</>
    
}