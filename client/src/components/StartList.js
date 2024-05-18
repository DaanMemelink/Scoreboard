import {useEffect, useRef, useState} from "react";

function StartList({officialTimeIsSet, athletes}) {
    const tableRef = useRef();
    const [windowSize, setWindowSize] = useState(window.innerWidth);


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
        let intervalIds = []

        document.fonts.ready.then(() => {
            if (tableRef.current) {
                const tableCells = tableRef.current.querySelectorAll('.tcell')
                tableCells.forEach(tableCell => {
                    const span = tableCell.querySelector('span')

                    if (span) {
                        if(span.scrollWidth > tableCell.offsetWidth) {
                            let diff = span.scrollWidth - tableCell.offsetWidth
                            diff = Math.ceil(diff / 10) * 10

                            let scrollPosition = 0
                            let scrollDirection = 1
                            const intervalId = setInterval(() => {
                                scrollPosition += 10 * scrollDirection
                                if (scrollPosition > diff) scrollDirection = -1
                                else if (scrollPosition < 0) scrollDirection = 1

                                span.style.transform = `translateX(-${scrollPosition}px)`;
                            }, 1000)

                            intervalIds.push(intervalId);
                        } else {
                            span.style.transform = 'translateX(0)'
                        }
                    }
                })

                if(tableRef.current.scrollHeight > tableRef.current.clientHeight) {
                    const diff = tableRef.current.scrollHeight - tableRef.current.clientHeight

                    let scrollPosition = 0
                    let scrollDirection = 1
                    const intervalId = setInterval(() => {
                        scrollPosition += 25 * scrollDirection
                        if (scrollPosition > diff) scrollDirection = -1
                        else if (scrollPosition < 0) scrollDirection = 1

                        const tbodyRows = tableRef.current.querySelectorAll('.tbody-trow');
                        tbodyRows.forEach(row => {
                            row.style.transform = `translateY(-${scrollPosition}px)`;
                        })
                    }, 1000)

                    intervalIds.push(intervalId)
                }
            }
        })

        return () => {
            intervalIds.forEach(id => clearInterval(id));
        }
    }, [athletes, windowSize])

    return (
        <>
            <div className="table" ref={tableRef}>
                <div className="trow thead-trow">
                    <div className="tcell lane">Baan</div>
                    <div className="tcell name">Naam</div>
                    <div className="tcell id">Start nr.</div>
                    <div className="tcell affiliation">Vereniging</div>
                    {officialTimeIsSet &&
                        <div className="tcell time">Tijd</div>
                    }
                </div>
                {athletes.map((athlete, index) => (
                    <div className="trow tbody-trow" key={index}>
                        <div className="tcell lane">{athlete.lane}</div>
                        <div className="tcell name"><span>{athlete.name}</span></div>
                        <div className="tcell id"><span>{athlete.id}</span></div>
                        <div className="tcell affiliation"><span>{athlete.affiliation}</span></div>
                        {officialTimeIsSet &&
                            <div className="tcell time"><span>{athlete.time}</span></div>
                        }
                    </div>
                ))}
            </div>
        </>
    );
}

export default StartList;