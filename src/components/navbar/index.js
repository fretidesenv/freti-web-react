import React from "react";
import './navbar.css'
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';

function Navbar(){

    const dispatch = useDispatch()


    var user = useSelector(state => state?.user);

    return(
        
        <nav className="navbar navbar-expand-lg ">
            <div className="container-fluid">
                <span className="navbar-brand text-white font-weight-bold ">
                    <strong>{user?.name}</strong>
                </span>
                
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <i className="fas fa-bars text-white"></i>
                </button>
                
                <div className="collapse navbar-collapse " id="navbarSupportedContent" >
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ">

                        <li className="nav-item">
                            <Link className="nav-link " aria-current="page" to="/">Home</Link>
                        </li>
                        { 
                            useSelector(state => state.usuarioLogado) > 0 ?
                            <>
                                {
                                    user.perfil == "Comercial" || user.perfil == "Admin" ? 

                                    <li className="nav-item">
                                        <Link className="nav-link " aria-current="page" to="/freightlist">Frete</Link>
                                    </li>
                                    : 
                                    ""
                                }
                                {
                                    user.perfil == "Admin" ? 
                                        <li className="nav-item">
                                            <Link className="nav-link " aria-current="page" to="/newUser">Cadastrar</Link>
                                        </li>
                                : 
                                    ""
                                }
                                <li className="nav-item">
                                    <Link className="nav-link " aria-current="page" to="#" onClick={() => dispatch({type: 'LOG_OUT'})}>Sair</Link>
                                </li>
                            </>
                                : 
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link " aria-current="page" to="/login">Login</Link>
                                </li>
                            </>
                        }
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;