import React,{useState, useEffect, useRef} from "react";

export default function InfiniteScroll(){
    const [items, setItems] = useState([]);
    const sectionRef = useRef(null);
    const loading = useRef(false);
    const hasMore = useRef(true);
    const itemLengthref = useRef(0);
    const lastElementRef = useRef(null);
    const intersectionObserverRef= useRef(null);
    async function fetchItems(){
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
    }

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
    
    



    return <>
                <div className="header-is4"><h1>Infinite Scroll</h1></div>
                    <section className="container-is4" ref={sectionRef}>
                    {
                        items.map((item, index)=>{
                        return <div key={item.id} className="item-is4" ref={index == items.length -1 ? lastElementRef:null} >
                                    <img src ={item.images[0]} alt={item.title}/>
                                </div>
                        })
                    }
                    </section>
                </>
        }