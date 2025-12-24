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
        const loading = useRef(false);
        const hasMore = useRef(true);
        async function fetchProducts(length:number){
            if(loading.current)
            {
                return;
            }
            loading.current= true;
            const response = await fetch(`https://dummyjson.com/products?limit=10&skip=${length}`);
            const responseData = (await response.json()).products;
            setItems((prev)=>[...prev, ...responseData]);
            loading.current = false;
        }

       const handleScroll = useCallback( function (){
            if(!eleRef.current || loading.current || !hasMore.current)
            {
                return;
            }
            const {clientHeight, scrollHeight, scrollTop} = eleRef.current;
            console.log(eleRef.current);
            console.log(clientHeight, scrollHeight, scrollTop)
            if(scrollHeight - (clientHeight + scrollTop) < 100)
            {
                fetchProducts(items.length);
            }

        },[items]);

        

        useEffect(()=>{
            const container = eleRef.current;
            if(!container)
            {
                return;
            }
            container.addEventListener("scroll", handleScroll)
            return (()=>container.removeEventListener("scroll", handleScroll));
        },[handleScroll]);

        useEffect(()=>{
            fetchProducts(0);
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