import React, {useEffect, useState, useRef} from "react";

export default function InfiniteScroll(){
    const [items, setitems] = useState([]);
    const hasMore = useRef(true);
    const sectionRef = useRef(null);
    const loading = useRef(false);

    async function fetchItems(){
            if(loading.current){
                return;
            }
            try{
 loading.current = true;
        const response = await fetch(`https://dummyjson.com/products?limit=10&skip=${items.length}`);
        const data = await response.json();
        const products = data?.products;

        if(products && products.length > 0)
        {
            console.log([...products]);
            setitems((prev)=>[...prev, ...products]);
        }
        else{
            hasMore.current=false
        }
        loading.current=false;
            }
            catch(e){
                console.error(e);
                setitems([])
            }
           
    }

    function handleScroll()
    {
        if(loading.current || !hasMore.current)
        {
            return;
        }
        const {scrollHeight, scrollTop, clientHeight} = sectionRef.current;

        if(scrollHeight - (scrollTop+clientHeight) < 100)
        {
            fetchItems();
        }
    }

    useEffect(()=>{
        const section = sectionRef.current;
        console.log(section);
        if(!section){
            return
        }

        section.addEventListener('scroll', handleScroll)
        return (()=>{
            section.removeEventListener('scroll', handleScroll)
        })
        
    },[items])


    useEffect(()=>{
        fetchItems();
    },[])

    console.log(items);

    return <>
        <h1 className="isHeader">Infinite Scroll</h1>
        <section className="isContainer" ref={sectionRef}>
            {
                items.map((item)=>{
                   return <div key={item.id} className="isitem">
                        <img src={item.thumbnail} alt={'Classic Navy Blue Baseball Cap'}/>
                        <div>{item.title}</div>
                        <div>{item.description}</div>
                    </div>
                })
            }

        </section>
    </>
}