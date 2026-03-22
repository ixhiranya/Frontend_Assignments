import React from "react";
type HeaderProps = {
    isBack?: boolean; //optional boolean
};
const Header: React.FC<HeaderProps>=({isBack})=>{
    return(
        <header style={{padding:"10px",background:"#eee"}}>
            {
                isBack && (
                    <button onClick={()=>window.history.back()}>
                        Back
                    </button>
                )
            }
            <h2>React Components task</h2>
        </header>
    );
};
export default Header;