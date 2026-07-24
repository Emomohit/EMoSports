import { useEffect, useRef } from 'react';
import { initApp } from '../main';

const LegacyEmoplay = () => {
  const isLoaded = useRef(false);

  useEffect(() => {
    // Only execute the script once the component mounts
    if (!isLoaded.current) {
      isLoaded.current = true;
      initApp().catch(err => console.error("Failed to initialize legacy app", err));
    }
  }, []);

  return (
    <>


      {/* ===================== BROWSE SCREEN ===================== */}
      <section id="browseScreen">


        <div className="hero" id="heroSection"></div>

        <div className="rows" id="rowsContainer"></div>

      </section>

      {/* ===================== MODAL ===================== */}
      <div id="modalOverlay">
        <div className="modal" id="modalContent"></div>
      </div>

      <div id="toast"></div>


    </>
  );
};

export default LegacyEmoplay;
