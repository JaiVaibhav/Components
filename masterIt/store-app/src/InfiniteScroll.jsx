// import react from 'react';
// import {useState, useEffect, useRef} from 'react';

// export default function InfiniteScroll(){

//     const [data, setData] = useState([]);
//     const containerRef = useRef(null);
//     const isLoadingRef = useRef(false);
//     const [hasMore, setHasMore] = useState(true);
//     const skippedItemRef = useRef(0)
//     async function fetchData(){
//         try{
//              if (isLoadingRef.current ){
//                 return;
//              }
//         isLoadingRef.current = true;
//         const response = await fetch(`https://dummyjson.com/products?limit=10&skip=${skippedItemRef.current}`);
//         const dataResp = await response.json();
//         setData((prev)=>[...prev, ...dataResp.products]); 
//         skippedItemRef.current += dataResp.products.length;   
//                 if(skippedItemRef.current >= dataResp.total)
//         {
//             setHasMore(false)
//         }
//         }
//         catch(e){
//          console.log(e.message);   
//         }
//         finally{
//             isLoadingRef.current= false;
//         }
            
//     }

//     function handleScroll(){
//         if(isLoadingRef.current || !hasMore){
//             return;
//         }
//         const {scrollHeight, clientHeight, scrollTop} = containerRef.current;
//         if(scrollHeight - (clientHeight+scrollTop) < 100)
//         {
//             fetchData();
//         }
//     }
    
//     useEffect(()=>{
//         const container = containerRef.current;

//     if (!container) return;

//     container.addEventListener("scroll", handleScroll);
//     fetchData();

//     return () => {
//         container.removeEventListener("scroll", handleScroll);
//     };
//     }, [])
    
//     return (<div>
//         Hello
//         <section ref={containerRef} className="container" style={{display:"flex", flexDirection:"row", flexWrap:"wrap", gap:"16px", height:"1000px", overflow:"scroll"}} >
//             {
//             data.map((d)=>  <div key={d.id} className="block" style={{height:"600px", width:"400px", background:"cyan", border:"1px solid black"}}>
//                     <img src={d.images[0]} alt="" width="400px" height="600px"/>
//             </div>)
//             }
           
//         </section>


//     </div>)
// }

import react from 'react';
import {useState, useEffect, useRef} from 'react'
export default function InfiniteScroll(){

 const [data, setData] = useState([]);
 const containerRef = useRef(null);
 const isLoading = useRef(false);
 const hasMore = useRef(true);
 const skippedItems = useRef(0);

 async function fetchData()
 {
    if(isLoading.current)
    {
        return;
    }
    try{
        isLoading.current = true;
        const response = await fetch(`https://dummyjson.com/products?limit=10&skip=${skippedItems.current}`);
        const dataResp = await response.json();
        skippedItems.current += dataResp.products.length;
        setData(prev=> [...prev, ...dataResp.products]);
        if(dataResp.total <= skippedItems.current)
            {
                hasMore.current = false;
            } 
    }
    catch(msg)
    {
        
    }
    finally{
        isLoading.current = false;
    }
 }


 function handleScroll()
 {
    console.log("asdf")
    if(isLoading.current || !hasMore.current)
    {
        return;
    }
    
    const {scrollHeight, clientHeight, scrollTop} = containerRef.current;

    if(scrollHeight - (clientHeight+scrollTop) < 100)
    {
        fetchData();
    }
 }

 useEffect(()=>{
    const container = containerRef.current;
    console.log(container);
    if(!container)
        return
    console.log("adfadsfadfs")
    container.addEventListener("scroll", handleScroll);
    fetchData();
    return (()=>{
        container.removeEventListener("scroll", handleScroll);
    })
 },[])



    return <div>
            <div ref={containerRef} className="container" style={{display:"flex", flexWrap:"wrap", justifyContent:"space-between", gap:"16px", height:"800px", overflow:"scroll"}}>
                {data.map((d)=>{
                    return <div key={d.title} className="blocks" style={{width:"500px", height:"600px", background:"grey", border:"1px solid black"}}>
                        <img src={d.images[0]} alt="" width="500px" height="600px"/>

                    </div>   
                })}
            </div>
    </div>
}