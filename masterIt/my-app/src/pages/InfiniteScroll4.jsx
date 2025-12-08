import React, { useEffect, useState, useRef } from "react";

export default function InfiniteScroll(){
    const [ items, setItems] = useState([])
    const sectionRef = useRef(null);
    const loading = useRef(false);
    const hasMore = useRef(true);
    async function fetchItems(){
        if(loading.current)
        {
            return
        }
        try{
            loading.current = true;
            const response = await fetch(`https://dummyjson.com/products?limit=10&skip=${items.length}`)
            const products = (await response.json())?.products;
            console.log(products);
            if(products?.length > 0)
            {
                setItems(prev=>[...prev, ...products]);
            }
            else{
                hasMore.current = false;
            }
        }catch(e){
            console.warn(e);
            setItems([])
        }finally{
            loading.current=false;
        }
    }
function handleScroll(){
    console.log('adsfasdf');
    if(loading.current || !hasMore.current)
    {
        return;
    }
    const {scrollHeight, scrollTop, clientHeight} = sectionRef.current;

    if(scrollHeight - (scrollTop + clientHeight) < 100)
    {
        fetchItems();
    }
}
    useEffect(()=>{
        const section = sectionRef.current;
        console.log("asdfasd", section);
        if(!section)
        {
            return;
        }
        section.addEventListener('scroll', handleScroll)
        return(()=>{
            section.removeEventListener('scroll', handleScroll)
        })
    },[items])

useEffect(()=>{
fetchItems();
},[])

    return <>
    <h1 className="header">Infinite Scroll</h1>
    <section className="container-is" ref={sectionRef}>
       { items.map((item)=>{
            return (<div key={item.id} className="item-is">
                <img src={item.thumbnail} alt={item.title} />
            </div>)
        })
    }
    </section>
    </>
}