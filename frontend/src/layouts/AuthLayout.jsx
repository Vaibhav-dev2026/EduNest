function AuthLayout({ children }) {

    return (

        <div
            className="container-fluid vh-100 d-flex justify-content-center align-items-center"
            style={{ background: "#F5F7FB" }}
        >

            <div
                className="card shadow-lg border-0"
                style={{
                    width: "420px",
                    borderRadius: "12px"
                }}
            >

                <div className="card-body p-4">

                    {children}

                </div>

            </div>

        </div>

    );

}

export default AuthLayout;