import TimeOfDay from "./TimeOfDay";

function Clock({runningTime}) {
    return (
        <>
            <div className={"clock"}>
                {runningTime ? (
                    <span className={"time running"}>
                        {runningTime}
                    </span>
                ) : (<TimeOfDay />)
                }
            </div>
        </>
    );
}
export default Clock;