import { useSnapshot } from "valtio";
import state from "./store";
import Canvas from "./canvas";
import Customizer from "./pages/Customizer";
import Home from "./pages/Home";
import StorePage from "./pages/StorePage";
import CartPage from "./pages/CartPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import SketchPage from "./pages/SketchPage"; // ⬅️ Import SketchPage
import { CartProvider } from "./context/CartContext";

function App() {
  const snap = useSnapshot(state);

  const showCanvas = snap.page === "customizer";

  return (
    
    <CartProvider>
      
      <main className="app transition-all ease-in">
        
        {showCanvas && <Canvas />}
        {snap.page === "home" && <Home />}

        
        {snap.page === "customizer" && <Customizer />}
        {snap.page === "store" && <StorePage />}
        {snap.page === "cart" && <CartPage />}
        {snap.page === "sketch" && <SketchPage />} {/* ⬅️ Sketch page */}

        {snap.page.startsWith("product-") && <ProductDetailsPage />}
      </main>
    </CartProvider>
  );
}

export default App;
