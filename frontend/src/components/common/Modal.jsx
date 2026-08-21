function Modal({

    id,

    title,

    children

}) {

    return (

        <div
            className="modal fade"
            id={id}
            tabIndex="-1"
        >

            <div className="modal-dialog">

                <div className="modal-content">

                    <div className="modal-header">

                        <h5>{title}</h5>

                        <button
                            className="btn-close"
                            data-bs-dismiss="modal"
                        ></button>

                    </div>

                    <div className="modal-body">

                        {children}

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Modal;