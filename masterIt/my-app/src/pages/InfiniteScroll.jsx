import React,{useState, useEffect, useRef, use, useCallback} from "react";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

export default function InfiniteScroll(){
    const [items, setItems] = useState([]);
    const sectionRef = useRef(null);
    const loading = useRef(false);
    const hasMore = useRef(true);
    const itemLengthref = useRef(0);
    //const lastElementRef = useRef(null);
    //const intersectionObserverRef= useRef(null);
    const fetchItems = useCallback(
    async function (){
        if(loading.current)
        {
            return;
        }
        try{
            loading.current = true;
            const response  = await fetch(`https://dummyjson.com/products?limit=10&skip=${itemLengthref.current}`);
            const respData = (await response.json()).products;
            if(respData && respData.length <= 0)
            {
                hasMore.current = false;
            }
            else
            setItems((prev)=>[...prev, ...respData]);
        }catch(e){
            console.log(error);
            setItems([]);
        }
        finally{
            loading.current = false;
        }
    },[])

    useEffect(()=>{
        itemLengthref.current = items.length;
    },[items])

    useEffect(()=>{
        fetchItems();
    },[])

    // function handleScroll(){
    //     if(loading.current || !hasMore.current)
    //     {
    //         return;
    //     }
    //     const {scrollHeight, scrollTop, clientHeight} = sectionRef.current;
    //     console.log(scrollHeight, scrollTop, clientHeight);
    //     if(scrollHeight - (scrollTop+clientHeight) < 100)
    //     {
    //         fetchItems();
    //     }
    // }

    // useEffect(()=>{
    //      fetchItems();
    //     const section = sectionRef.current;
    //     if(!section){
    //         return;
    //     }
    //     section.addEventListener('scroll', handleScroll);
    //     return ()=>section.removeEventListener('scroll', handleScroll);
    // },[])

    // useEffect(()=>{
    //    itemLengthref.current = items.length;
    // },[items])
    
    // useEffect(()=>{
    //     fetchItems();
    //         intersectionObserverRef.current = new IntersectionObserver((entries)=>{
    //     if(loading.current || !hasMore.current)
    //     {
    //         return;
    //     }
    //     const entry = entries[0];
    //     console.log(entry.isIntersecting);
    //     if(entry.isIntersecting)
    //     {
    //         fetchItems();
    //     }
    // },{
    //     root:sectionRef.current,
    //     rootMargin:"0px 0px 100px 0px",
    //     threshold:0.2,
    // });
    // },[])

    // useEffect(()=>{
    //      itemLengthref.current = items.length;
    //     const lastItem = lastElementRef.current
    //     console.log(lastItem)
    //     if(!lastItem)
    //     {
    //         return;
    //     }
    //     const observer =intersectionObserverRef.current;
    //     observer.observe(lastItem);
    //     return ()=>{
    //          if(lastItem)
    //     {
    //         observer.unobserve(lastItem);
    //     }
    //     }
    // },[items]);

    const lastItemRef= useInfiniteScroll(fetchItems, hasMore, {
        root:sectionRef.current,
        rootMargin:"0px 0px 200px 0px",
        threshold:0.2
    })

    return <>
                <div className="header-is4"><h1>Infinite Scroll</h1></div>
                    <section className="container-is4" ref={sectionRef}>
                    {
                        items.map((item, index)=>{
                        return <div key={item.id} className="item-is4" ref={index == items.length -1 ? lastItemRef:null} >
                                    <img src ={item.images[0]} alt={item.title}/>
                                </div>
                        })
                    }
                    </section>
                </>
        }