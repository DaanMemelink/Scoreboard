import {useEffect, useLayoutEffect, useRef, useState} from "react";

function StartList({officialTimeIsSet, athletes}) {
    const tableRef = useRef()
    const tableHeaderRef = useRef()
    const tableContentRef = useRef()
    const tableCellRefs = useRef([])
    const [windowSize, setWindowSize] = useState(window.innerWidth)

    useEffect(() => {
        const handleResize = () => {
            setWindowSize(window.innerWidth)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    //Make table scroll if it's too high or if cell is too wide
    useEffect(() => {
        const parent = tableRef.current;
        const header = tableHeaderRef.current
        const children = tableContentRef.current

        if (parent && header && children) {
            const parentHeight = parent.clientHeight;
            const headerHeight = header.clientHeight;
            const childrenHeight = children.scrollHeight;
            const scrollDistance = Math.max(0, childrenHeight - (parentHeight - headerHeight));
            document.documentElement.style.setProperty('--table-scroll-distance', `${scrollDistance}px`);

            const averageChildHeight = childrenHeight / athletes.length; // Average height per child
            const scrollDuration = averageChildHeight * 0.05
            children.style.animationDuration = `${scrollDuration}s`

            if(tableCellRefs.current) {
                tableCellRefs.current.forEach(tableCell => {
                    const children = tableCell.children; // Get all direct children of tableCell

                    // Loop through each child to check its width
                    Array.from(children).forEach(child => {
                        // Check if the child's scrollWidth exceeds the tcell's clientWidth
                        if (child.scrollWidth > tableCell.offsetWidth) {
                            const scrollDistance = tableCell.offsetWidth

                            // Apply an inline style for `transform` only for this specific child
                            child.style.setProperty('--table-cell-scroll-distance', `${scrollDistance}px`);
                            child.style.animationDuration = `${child.scrollWidth / 25}s`; // Adjust speed as needed

                            child.classList.add('scroll'); // Add scrolling class if child is wider
                        } else {
                            child.classList.remove('scroll'); // Remove if not wider
                        }
                    });
                })
            }
        }
    }, [athletes, windowSize, tableRef])

    return (
        <>
            <div className="table" ref={tableRef}>
                <div className="trow thead-trow" ref={tableHeaderRef}>
                    <div className="tcell lane">Baan</div>
                    <div className="tcell name">Naam</div>
                    <div className="tcell id">Start nr.</div>
                    <div className="tcell affiliation">Vereniging</div>
                    {officialTimeIsSet &&
                        <div className="tcell time">Tijd</div>
                    }
                </div>

                <div className="table-content" ref={tableContentRef}>
                    {athletes.map((athlete, index) => (
                        <div className="trow tbody-trow" key={index}>
                            <div className="tcell lane">{athlete.lane}</div>
                            <div className="tcell name" ref={element => tableCellRefs.current[index] = element}><span>{athlete.name}</span></div>
                            <div className="tcell id"><span>{athlete.id}</span></div>
                            <div className="tcell affiliation"><span>{athlete.affiliation}</span></div>
                            {officialTimeIsSet &&
                                <div className="tcell time"><span>{Math.ceil(athlete.time * 100) / 100}</span></div>
                            }
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default StartList;
