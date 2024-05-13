import TimelineChart from './TimelineChart'
import { useState } from 'react'
import FCFS from './algoritmos/FCFS'
import STRF from './algoritmos/SRTF'
import SJF from './algoritmos/SJF'
import RR from './algoritmos/RR'
import { programas } from './algoritmos/mockData'

function App() {

  const procesos = programas.map((programa) => {
    return {
      programa,
      espera_reciente: 0,
      counterEjecucion: 0,
      counterEspera: 0,
      contadoresBloqueos: Array(programa.bloqueos.length).fill(0),
      counterNumBloqueo: 0,
      arrayEstados: [],
      terminado: false,
    };
  });
  const q = 3;
  console.log(procesos)
  //const result = FCFS(procesos)
  // const result = STRF(procesos)
  //  const result = SJF(procesos)
   const result = RR(q, procesos)
  // console.log(procesos.planificador_data)
  const [ejecution_data, setEjecution_data] = useState(result.ejecution_data)

  const [ocupado_data, setOcupado_data] = useState(result.ocupado_data)

  const [en_espera_data, setEn_espera_data] = useState(result.en_espera_data)

  const [planificador_data, setPlanificador_data] = useState(result.planificador_data)

  const [labels, setLabels] = useState(result.labels)

  const ticks = result.tick

  return (
    <>
      <h1>Timeline</h1>
      <div>
        <TimelineChart ejecution_data={ejecution_data} ocupado_data={ocupado_data} en_espera_data={en_espera_data} planificador_data={planificador_data} labels_array={labels} ticks={ticks} />
      </div>

    </>
  )
}

export default App
