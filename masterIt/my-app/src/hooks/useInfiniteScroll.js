import React,{useEffect, useRef} from "react";

export default function useInfiniteScroll(callback, hasMore, options){
    const lastItemRef= useRef(null);


    useEffect(()=>{
        const node = lastItemRef.current;
        if(!node || !hasMore.current)
        {
            return;
        }

        const intersectionObserver = new IntersectionObserver((entries)=>{
            const entry = entries[0];

            if(entry.isIntersecting)
            {
                callback();
            }
        },{
            ...options
        })

        intersectionObserver.observe(node);

        return ()=> intersectionObserver.unobserve(node);
    },[callback, hasMore, options]);

    return lastItemRef;
}