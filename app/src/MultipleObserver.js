import { useInView } from 'react-intersection-observer';

const MultipleObserver = ( {children} ) => {

    const { ref, inView } = useInView({ triggerOnce: false });

    return (
             <div ref={ref}>    
               { inView ? children : 'Loading...' }
             </div>
          )
}

export default MultipleObserver;