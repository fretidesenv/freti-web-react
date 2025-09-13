import React, { useEffect, useState } from "react";
import './home.css'
import PersistentDrawerLeft from "../../components/navMenu/NavMenu";
import Dashboard from "../../components/dashboard/Dashboard";
import { Container } from "@mui/material";

function Home(){
    
    return (
        <>
        <Container maxWidth="lx" sx={{ bgcolor: '#EBEBEB', height: '100vh' }}>
            <PersistentDrawerLeft divOpen={

                <div className="container">
                    <Dashboard />
                </div>
            } />
        </Container>
    </>
    );
}


export default Home;