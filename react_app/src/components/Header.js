import React from 'react';
function Header({isBack}){
    return(
        <header style={{padding:"10px",background:"white"}}>
            {isBack && (
                <button onClick={()=>window.history.back()}>Back</button>
            )}
            <h2>My React App</h2>
        </header>
    );
}
export default Header;
/*TASK1 : isBack is a prop
If isBack is true, the Back button appears
If `false/undefined**, it won't show*/