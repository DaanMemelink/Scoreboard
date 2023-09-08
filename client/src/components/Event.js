function Event({eventInfo, athletes}) {
    return (
        <>
            <div className="event">
                <header>
                    <h1>{eventInfo.title}</h1>
                </header>
                <div className="table">
                    <table>
                        <thead>
                            <tr>
                                <th>Positie</th>
                                <th>Naam</th>
                                <th>Start nr.</th>
                                <th>Baan</th>
                                <th>Vereniging</th>
                                <th>Tijd</th>
                                {eventInfo.wind && <th>Wind</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {athletes.map((athlete, index) => (
                                <tr key={index}>
                                    <td>{athlete.place}</td>
                                    <td>{athlete.name}</td>
                                    <td>{athlete.id}</td>
                                    <td>{athlete.lane}</td>
                                    <td>{athlete.affiliation}</td>
                                    <td>{athlete.time}</td>
                                    {eventInfo.wind && <td>{athlete.time && eventInfo.wind}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Event;