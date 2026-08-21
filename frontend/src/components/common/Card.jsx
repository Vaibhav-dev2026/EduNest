function Card({ title, children }) {

    return (

        <div className="card shadow-sm border-0">

            <div className="card-header bg-white">

                <h5>{title}</h5>

            </div>

            <div className="card-body">

                {children}

            </div>

        </div>

    );

}

export default Card;