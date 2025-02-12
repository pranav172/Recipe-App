import chefClaudeLogo from "../images/claude chef.jpeg";

export default function Header() {
    return (
        <header>
            <img src={chefClaudeLogo} alt="Chef Claude Logo" />
            <h1>Chef Claude</h1>
        </header>
    );
}

