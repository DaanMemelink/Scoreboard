import {useEffect, useRef, useState} from "react";

function StartList({athletes}) {
    const tableBodyRef = useRef();
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

    //Make text scroll if it's too long
    useEffect(() => {
        let intervalIds = [];

        document.fonts.ready.then(() => {
            if (tableBodyRef.current) {
                const tds = tableBodyRef.current.querySelectorAll('td')
                tds.forEach(td => {
                    const span = td.querySelector('span')

                    if (span) {
                        if(span.scrollWidth > td.offsetWidth - 50) {
                            let diff = span.scrollWidth - td.offsetWidth + 25
                            diff = Math.ceil(diff / 10) * 10

                            let scrollPosition = 0
                            let scrollDirection = 1
                            const intervalId = setInterval(() => {
                                scrollPosition += 10 * scrollDirection
                                if (scrollPosition > diff) {
                                    scrollDirection = -1
                                }
                                if (scrollPosition < 0) {
                                    scrollDirection = 1
                                }

                                span.style.transform = `translateX(-${scrollPosition}px)`;
                            }, 1000)

                            intervalIds.push(intervalId);
                        } else {
                            span.style.transform = 'translateX(0)'
                        }
                    }
                })

                // const trs = tableBodyRef.current.querySelectorAll('tr')
                // trs.forEach(tr => {
                // })


                console.log(tableBodyRef.current.scrollHeight, tableBodyRef.current.clientHeight)


                if(tableBodyRef.current.scrollHeight > tableBodyRef.current.clientHeight) {
                    let scrollPosition = 0
                    let scrollDirection = 1
                    const intervalId = setInterval(() => {
                        scrollPosition += 25 * scrollDirection
                        if (scrollPosition > tableBodyRef.current.scrollHeight - tableBodyRef.current.clientHeight) {
                            scrollDirection = -1
                        }
                        if (scrollPosition < 0) {
                            scrollDirection = 1
                        }

                        tableBodyRef.current.style.transform = `translateY(-${scrollPosition}px)`;
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
            <table>
                <thead>
                    <tr>
                        <th>Baan</th>
                        <th>Naam</th>
                        <th>Start nr.</th>
                        <th>Vereniging</th>
                        {/*<th>Tijd</th>*/}
                    </tr>
                </thead>
                <tbody ref={tableBodyRef}>
                    {athletes.map((athlete, index) => (
                        <tr key={index}>
                            <td>{athlete.lane}</td>
                            <td><span>{athlete.name}{athlete.name}</span></td>
                            <td><span>{athlete.id}</span></td>
                            <td><span>{athlete.affiliation}</span></td>
                            {/*<td>{athlete.time}</td>*/}
                        </tr>
                    ))}
                    {athletes.map((athlete, index) => (
                        <tr key={index}>
                            <td>{athlete.lane}</td>
                            <td><span>{athlete.name}{athlete.name}</span></td>
                            <td><span>{athlete.id}</span></td>
                            <td><span>{athlete.affiliation}</span></td>
                            {/*<td>{athlete.time}</td>*/}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default StartList;