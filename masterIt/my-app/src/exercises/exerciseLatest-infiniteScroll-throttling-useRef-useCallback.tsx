import React, { useState, useEffect, useRef, useCallback } from 'react';


export function Tiles({tilesDetails}){
    return <>
    <style>
        {`
          .tiles{
                    width:40%;
                }
        `}
        </style>
    <div className='tiles'>
        <img src={tilesDetails.images[0]} alt={tilesDetails.title} width="100%"/>
        <p></p>
    </div> 
    </>
}
export default function InfiniteScroll(){
        const [items, setItems] = useState<Array<any>>([]);
        const eleRef = useRef<HTMLDivElement | null>(null);
        const lastExecutedTime = useRef(0);
        const hasMore = useRef(true);
        const itemLengthRef = useRef(0);
        const loading = useRef(false)
        const abortControllerRef = useRef<AbortController | null>(null);
        async function fetchProducts(){
            let controller;
            try{

            if(abortControllerRef.current)
            {
                abortControllerRef.current.abort();
            }
              loading.current=true;
              controller = new AbortController();
              abortControllerRef.current = controller;
            const response = await fetch(`https://dummyjson.com/products?limit=10&skip=${itemLengthRef.current}`,{signal: controller.signal});
            const {products, total} = (await response.json())

            
            if(abortControllerRef.current === controller){
            setItems((prev)=>{
                const newItemsList = [...prev, ...products];
                itemLengthRef.current = newItemsList.length;
                if(total === newItemsList.length)
                {
                    hasMore.current = false;
                }
                return newItemsList;
                  
            });
            }
        }
        catch(e)
        {
            if(e.name==="AbortError")
            {
                console.log("Mission Aborted")
            }
            else{
                console.log("Mission failed");
            }
        }
        finally{
     
            if(abortControllerRef.current === controller)
            {
                       loading.current=false;
                abortControllerRef.current = null;
            }
         }
        }

       const handleScroll = useCallback( function (){
            if((new Date()).getTime() - lastExecutedTime.current < 500)
                {
                    return;
                }
             if(!eleRef.current || loading.current || !hasMore.current)
                {
                    return;
                }
                 lastExecutedTime.current = (new Date()).getTime();;
            const {clientHeight, scrollHeight, scrollTop} = eleRef.current;
            if(scrollHeight - (clientHeight + scrollTop) < 100)
                {
                 fetchProducts();
                }
        },[]);

        

        useEffect(()=>{
            const container = eleRef.current;
            if(!container)
            {
                return;
            }
            container.addEventListener("scroll", handleScroll)
            return (()=>container.removeEventListener("scroll", handleScroll));
        },[]);

        useEffect(()=>{
            fetchProducts();
            return (()=>{
                if(abortControllerRef.current)
                {
                    abortControllerRef.current.abort();
                    abortControllerRef.current=null;
                }
            })
        },[])
    return (
        <>
        <style>
              {`
          .containers{
                    width:100%;
                    display:flex;
                    flex-wrap:wrap;
                   justify-content:center;
                   gap:16px;
                   background:cyan;
                   height:100vh;
                   overflow:scroll;
                }
        `}
        </style>
        <section className='containers' ref={eleRef}>
            {
                items.map((item)=>{
                    return <Tiles tilesDetails={item}/>
                })
            }
        </section>
    </>
    )
}