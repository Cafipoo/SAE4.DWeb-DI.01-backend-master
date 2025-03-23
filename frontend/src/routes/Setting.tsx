import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Button from '../ui/Button';
import { DataRequests } from '../data/data-requests';
const Setting = () => {
    let user = localStorage.getItem("user");
    let userJson = JSON.parse(user!);
    let reloading = userJson.reloading;
    if (reloading == null) {
        reloading = 0;
    }
  const [sliderValue, setSliderValue] = useState(reloading);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(event.target.value));
  };

  const handleSubmit = async () => {
    try {
      await DataRequests.updateSetting(userJson.id, sliderValue);
      let user = localStorage.getItem("user");
      let datauser = JSON.parse(user!);
      datauser.reloading = sliderValue;
      localStorage.setItem("user", JSON.stringify(datauser));
      setSliderValue(sliderValue);

    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 md:ml-72 max-w-[600px]">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-6">Paramètres</h1>
          
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="mb-4">
              <label className="block text-white text-lg mb-2">
                Fréquence du rafraîchissement : {sliderValue} minute(s)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            
            <div className="flex justify-between text-gray-400 text-sm">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
            <p className="text-gray-400 text-sm">Laisser la valeur à 0 désactive le rafraîchissement automatique</p>
            <Button variant="tertiary" className="mt-4" onClick={handleSubmit}>Modifier</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Setting;