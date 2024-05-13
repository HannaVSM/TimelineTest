export default function RR(quantum, arrayProcesos) {
  //   console.log(arrayProcesos);
  //1. Ordenar el array por prioridad (menos ejecucion restante)
  arrayProcesos = orderArrayProcesos(arrayProcesos);
  //2. Inicializar arrays de estados con contenido [{x: PID, y: [number,number]}]
  let ejecution_data = [];
  let ocupado_data = [];
  let en_espera_data = [];
  let planificador_data = [];
  //3. Inicializar contador de cpu_desaprovechada
  let cpu_desaprovechada = 0;
  //4. Inicializar array de labels
  const labels = ["Pl"];
  //5. Inicializar contador ticks y booleano Fin (Que sera true si todos los procesos tienen el bool terminado en true)
  let tick = 0;
  let plan = 0;
  let fin = false;
  let mulPlan = 0;
  //--------------------------
  //6. Iniciar while mientras !Fin
  while (!fin) {
    let isProcesoEnEjecucion = false;
    let reorder = false; // Por si hay que reordenar el array por llegada
    let changePriority = false; // Por si hay que mover un proceso al inicio del array
    let changePriorityPID = undefined; // PID del proceso a mover
    let finalPriority = false; // Por si hay que mover un proceso al inicio del array
    let finalPriorityPID = [];
    let finalTick = 0;
    for (let i = 0; i < arrayProcesos.length; i++) {

      let proceso = arrayProcesos[i];
      //si es el primer tick, se ejecuta el planificador
      if (tick == 0 || plan > quantum) {
        planificador_data.push({ x: "Pl", y: [tick, tick + 1] });
        isProcesoEnEjecucion = true;
        console.log(plan + "  tick: " + tick);
        plan = 0;
      }

      if (proceso.terminado) {
        continue;
      }

      if (proceso.arrayEstados.length === 0) {
        //De ser asi,
        //Se verifica si la llegada del programa del proceso es igual al tick actual, si no es asi continua a la siguiente iteracion

        if (proceso.programa.llegada !== tick) {
          continue;
        }

        //Se añade su pid al inicio del array de labels
        labels.unshift(proceso.programa.pid);
        //Se verifica si hay algun proceso en ejecucion
        if (isProcesoEnEjecucion) {
          //De ser asi
          //Se añade al array de estados del proceso 'Espera', se suma uno a counterEspera
          proceso.arrayEstados.push("Espera");
          proceso.counterEspera++;
          //Se añade el objeto al array en_espera_data
          en_espera_data.push({ x: proceso.programa.pid, y: [tick, tick + 1] });
          //actualizar el proceso en el array de procesos
          actualizarProceso(arrayProcesos, proceso, proceso.programa.pid);
          continue;
        }
        //Sino
        //Se añade al array de estados del proceso 'En ejecucion'
        proceso.arrayEstados.push("Ejecucion");
        //Se suma uno al contador de ejecucion del programa
        proceso.counterEjecucion++;
        //Se añade el objeto al array en_ejecucion_data.
        ejecution_data.push({ x: proceso.programa.pid, y: [tick, tick + 1] });
        //Se pasa el booleano isProcesoEnEjecucion a true
        isProcesoEnEjecucion = true;
        //se revisa si el contador de ejecucion es igual a la duracion del programa dentro del proceso, para saber si ya termino el proceso.
        if (proceso.counterEjecucion === proceso.programa.duracion) {
          plan = 3;
          //De ser asi el booleano terminado del proceso pasa a true
          proceso.terminado = true;
          //se actualizan las estadisticas del programa
          proceso = calcularEstadisticasProceso(proceso, tick);
        }
        //actualizar el proceso en el array de procesos
        actualizarProceso(arrayProcesos, proceso, proceso.programa.pid);
        changePriority = true;
        changePriorityPID = proceso.programa.pid;
        //Se mueve el actual proceso al inicio del arrayProcesos
        continue;
      }
      //Sino,
      //Revisar el ultimo de estado de este proceso y comparar segun el estado.
      const ultimoEstado =
        proceso.arrayEstados[proceso.arrayEstados.length - 1];
      //------------------------------------------------------------------------------------------------------------------------------
      //(Caso 'Ejecucion')
      if (ultimoEstado === "Ejecucion") {
        //Se crea un booleano para saber si hay un bloqueo en este tick
        let IsBloqueoInThisTick = false;
        //Realizar un for que itere el array de bloqueos del proceso
        for (let j = 0; j < proceso.programa.bloqueos.length; j++) {
          //Se compara si el contador de ejecucion del proceso es igual a alguna llegada de bloqueo
          if (
            proceso.counterEjecucion === proceso.programa.bloqueos[j].llegada
          ) {
            IsBloqueoInThisTick = true;
            break;
          }
        }
        //Se verifica si IsBloqueoInThisTick es true
        if (IsBloqueoInThisTick) {
          //Se añade al array de estados del proceso 'Bloqueo'
          proceso.arrayEstados.push("Bloqueo");
          //Se aumenta contadoresBloqueos[proceso.counterNumBloqueos]
          proceso.contadoresBloqueos[proceso.counterNumBloqueo]++;
          //Se añade el objeto al array ocupado_data con x: [tick, tick+1]
          ocupado_data.push({ x: proceso.programa.pid, y: [tick, tick + 1] });
          //actualizar el proceso en el array de procesos
          actualizarProceso(arrayProcesos, proceso, proceso.programa.pid);
          reorder = true;
          plan = 4;
          continue;
        }
        //Sino
        //Se verifica si isProcesoEnEjecucion es true
        if (isProcesoEnEjecucion) {
          //Se añade al array de estados del proceso 'Espera'
          proceso.arrayEstados.push("Espera");
          //Se suma uno a counterEspera
          proceso.counterEspera++;
          //Se añade el objeto al array en_espera_data
          en_espera_data.push({
            x: proceso.programa.pid,
            y: [tick, tick + 1],
          });
          //actualizar el proceso en el array de procesos
          actualizarProceso(arrayProcesos, proceso, proceso.programa.pid);
          continue;
        }
        if(plan == quantum){
          finalPriority = true;
          finalPriorityPID.push(proceso.programa.pid);
          finalTick = tick;
        }
        //Sino
        //Se añade al array de estados del proceso 'En ejecucion'
        proceso.arrayEstados.push("Ejecucion");
        //Se suma uno al contador de ejecucion del programa
        proceso.counterEjecucion++;
        //Se añade el objeto al array en_ejecucion_data.
        ejecution_data.push({
          x: proceso.programa.pid,
          y: [tick, tick + 1],
        });
        //Se pasa el booleano isProcesoEnEjecucion a true
        isProcesoEnEjecucion = true;
        //se revisa si el contador de ejecucion es igual a la duracion del programa dentro del proceso.
        if (proceso.counterEjecucion === proceso.programa.duracion) {
          plan = 3;
          //De ser asi el booleano terminado del proceso pasa a true
          proceso.terminado = true;
          //se actualizan las estadisticas del programa
          proceso = calcularEstadisticasProceso(proceso, tick);
        }
        //actualizar el proceso en el array de procesos
        actualizarProceso(arrayProcesos, proceso, proceso.programa.pid);
        //Se mueve el actual proceso al inicio del arrayProcesos
        changePriority = true;
        changePriorityPID = proceso.programa.pid;
        continue;
      }
      //(Caso 'Bloqueo')
      if (ultimoEstado === "Bloqueo") {
        if (
          proceso.contadoresBloqueos[proceso.counterNumBloqueo] ===
          proceso.programa.bloqueos[proceso.counterNumBloqueo].duracion - 1
        ) {
          finalPriority = true;
          finalPriorityPID.push(proceso.programa.pid);
          finalTick = tick;
        }
        //Revisar si contadoresBloqueos[proceso.counterNumBloqueos] es igual a la llegada del bloqueo en el programa
        //Para saber si terminó el bloqueo
        if (
          proceso.contadoresBloqueos[proceso.counterNumBloqueo] ===
          proceso.programa.bloqueos[proceso.counterNumBloqueo].duracion
        ) {
          //De ser asi
          //Se incrementa proceso.counterNumBloqueos
          proceso.counterNumBloqueo++;
          //Se verifica si isProcesoEnEjecucion es true
          if (isProcesoEnEjecucion) {
            //De ser asi
            //Se añade al array de estados del proceso 'Espera'
            proceso.arrayEstados.push("Espera");
            //Se suma uno a counterEspera
            proceso.counterEspera++;
            //Se añade el objeto al array en_espera_data
            en_espera_data.push({
              x: proceso.programa.pid,
              y: [tick, tick + 1],
            });
            //actualizar la el proceso en el array de procesos
            actualizarProceso(arrayProcesos, proceso, proceso.programa.pid);
            continue;
          }
          //Sino
          //Se añade al array de estados del proceso 'En ejecucion'
          proceso.arrayEstados.push("Ejecucion");
          //Se suma uno al contador de ejecucion del programa
          proceso.counterEjecucion++;
          //Se añade el objeto al array en_ejecucion_data.
          ejecution_data.push({ x: proceso.programa.pid, y: [tick, tick + 1] });
          //Se pasa el booleano isProcesoEnEjecucion a true.
          isProcesoEnEjecucion = true;
          //Se revisa si el contador de ejecucion es igual a la duracion del programa dentro del proceso.
          if (proceso.counterEjecucion === proceso.programa.duracion) {
            plan = 3;
            //De ser asi el booleano terminado del proceso pasa a true
            proceso.terminado = true;
            proceso = calcularEstadisticasProceso(proceso, tick);
          }
          //actualizar la el proceso en el array de procesos
          actualizarProceso(arrayProcesos, proceso, proceso.programa.pid);
          //Se mueve el actual proceso al inicio del arrayProcesos
          changePriority = true;
          changePriorityPID = proceso.programa.pid;
          continue;
        }
        //Sino
        //Se añade al array de estados del proceso 'Bloqueo'
        proceso.arrayEstados.push("Bloqueo");
        //Se aumenta contadoresBloqueos[proceso.counterNumBloqueos]
        proceso.contadoresBloqueos[proceso.counterNumBloqueo]++;
        //Se añade el objeto al array ocupado_data con x: [tick, tick+1]
        ocupado_data.push({ x: proceso.programa.pid, y: [tick, tick + 1] });
        //actualizar la el proceso en el array de procesos
        actualizarProceso(arrayProcesos, proceso, proceso.programa.pid);
        continue;
      }
      //(Caso 'Espera')
      if (ultimoEstado === "Espera") {
        //Se verifica si isProcesoEnEjecucion es true
        if (isProcesoEnEjecucion) {
          //De ser asi
          //Se añade al array de estados del proceso 'Espera', se suma uno a counterEspera
          proceso.arrayEstados.push("Espera");
          proceso.counterEspera++;
          //Se añade el objeto al array en_espera_data
          en_espera_data.push({ x: proceso.programa.pid, y: [tick, tick + 1] });
          //actualizar la el proceso en el array de procesos
          actualizarProceso(arrayProcesos, proceso, proceso.programa.pid);
          continue;
        }
        //Sino
        //Se añade al array de estados del proceso 'En ejecucion'
        proceso.arrayEstados.push("Ejecucion");
        //Se suma uno al contador de ejecucion del programa
        proceso.counterEjecucion++;
        //Se añade el objeto al array en_ejecucion_data
        ejecution_data.push({ x: proceso.programa.pid, y: [tick, tick + 1] });
        //Se pasa el booleano isProcesoEnEjecucion a true
        isProcesoEnEjecucion = true;
        //Se revisa si el contador de ejecucion es igual a la duracion del programa dentro del proceso.
        if (proceso.counterEjecucion === proceso.programa.duracion) {
          plan = 3;
          //De ser asi el booleano terminado del proceso pasa a true
          proceso.terminado = true;
          proceso = calcularEstadisticasProceso(proceso, tick);
        }
        //actualizar la el proceso en el array de procesos
        actualizarProceso(arrayProcesos, proceso, proceso.programa.pid);
        //Se mueve el actual proceso al inicio del arrayProcesos
        changePriority = true;
        changePriorityPID = proceso.programa.pid;
        continue;
      }
    }
    if (!isProcesoEnEjecucion) {
      cpu_desaprovechada++;
    }
    //11. Si reorder es true, ordenar arrayProcesos por llegada
    // if (reorder) {
    //   arrayProcesos = orderArrayProcesos(arrayProcesos);
    // }
    //12. Si changePriority es true, mover el proceso con pid igual a changePriorityPID al inicio del arrayProcesos
    // if (changePriority) {
    //   //buscar en arrayProcesos el proceso con pid igual a changePriorityPID y moverlo al inicio del array sin usar el array de procesos
    //   arrayProcesos.unshift(
    //     arrayProcesos.splice(
    //       arrayProcesos.findIndex(
    //         (proceso) => proceso.programa.pid === changePriorityPID
    //       ),
    //       1
    //     )[0]
    //   );
    // }

    if (finalPriority) {
      // console.log("Array en el tick " + tick + ":");
      // console.log(JSON.stringify(finalPriorityPID))
      // console.log(JSON.stringify(arrayProcesos));
      // Obtener el índice del objeto después del cual deseas colocar el objeto a mover
      const indiceAntesDe = arrayProcesos.findIndex(objeto => objeto.programa.llegada >= finalTick);
      // Si se encontró el índice válido, insertar el objeto a mover después de ese índice
      if (indiceAntesDe !== -1) {
        console.log("entrar hasta que g se ejecute")
        // Eliminar el objeto a mover del array original
        const objetosAMover = arrayProcesos.filter(objeto => finalPriorityPID.includes(objeto.programa.pid));
        arrayProcesos = arrayProcesos.filter(objeto => !finalPriorityPID.includes(objeto.programa.pid));
        if(objetosAMover.length > 1){
          arrayProcesos.splice(indiceAntesDe - 2, 0, ...objetosAMover);
        }else{
          // Insertar el objeto a mover después del índice deseado
          arrayProcesos.splice(indiceAntesDe - 1, 0, ...objetosAMover);
        }

      } else {
        // console.log("si g ya se ejecutó")
        const idObjetoAMover = finalPriorityPID[0];

        // Filtrar el array para obtener el objeto que deseas mover
        const objetoAMover = arrayProcesos.find(objeto => objeto.programa.pid === idObjetoAMover);

        // Filtrar el array para excluir el objeto que deseas mover
        const arraySinObjetoAMover = arrayProcesos.filter(objeto => objeto.programa.pid !== idObjetoAMover);

        // Concatenar el objeto movido al final del nuevo array
        arrayProcesos = arraySinObjetoAMover.concat(objetoAMover);

      }
      // console.log("Despues de... ");
      // console.log(JSON.stringify(arrayProcesos));

    }
    plan++;
    //13.Revisar si hay alguno de los procesos que no haya terminado, de ser asi se mantiene el booleano fin en false
    fin = !arrayProcesos.some((proceso) => !proceso.terminado);
    //14. Sumar uno al tick
    tick++;
  }

  // orderArrayProcesos(arrayProcesos);

  //12. Retornar un objeto con los arrays de estados y labels y el contador de cpu_desaprovechada
  return {
    ejecution_data: ejecution_data,
    ocupado_data: ocupado_data,
    en_espera_data: en_espera_data,
    cpu_desaprovechada: cpu_desaprovechada,
    labels: labels,
    tick: tick,
    arrayProcesos,
    planificador_data
  };
}


function orderArrayProcesos(arrayProcesos) {
  return arrayProcesos.sort((a, b) => a.programa.llegada - b.programa.llegada);
}

function calcularEstadisticasProceso(proceso, tick) {
  proceso.programa.estadisticas.ejecucion = proceso.counterEjecucion;
  proceso.programa.estadisticas.espera = proceso.counterEspera;
  proceso.programa.estadisticas.bloqueo = proceso.contadoresBloqueos.reduce(
    (a, b) => a + b,
    0
  );
  proceso.programa.estadisticas.instante_fin = tick;
  proceso.programa.estadisticas.retorno =
    proceso.programa.estadisticas.instante_fin - proceso.programa.llegada;
  proceso.programa.estadisticas.tiempo_perdido =
    proceso.programa.estadisticas.retorno -
    proceso.programa.estadisticas.ejecucion;
  proceso.programa.estadisticas.penalidad =
    proceso.programa.estadisticas.retorno /
    proceso.programa.estadisticas.ejecucion;
  return proceso;
}

function actualizarProceso(arrayProcesos, proceso, pid) {
  //buscar en arrayProcesos el proceso con pid y actualizarlo
  arrayProcesos[
    arrayProcesos.findIndex((proceso) => proceso.programa.pid === pid)
  ] = proceso;
}
