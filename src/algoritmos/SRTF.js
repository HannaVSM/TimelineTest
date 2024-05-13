export default function SRTF(arrayProcesos) {
  //   console.log(arrayProcesos);
  //1. Ordenar el array por prioridad (menos ejecucion restante)
  arrayProcesos = orderArrayProcesos(arrayProcesos);
  console.log(arrayProcesos);
  //2. Inicializar arrays de estados con contenido [{x: PID, y: [number,number]}]
  let ejecution_data = [];
  let ocupado_data = [];
  let en_espera_data = [];
  //3. Inicializar contador de cpu_desaprovechada
  let cpu_desaprovechada = 0;
  //4. Inicializar array de labels
  const labels = [];
  //5. Inicializar contador ticks y booleano Fin (Que sera true si todos los procesos tienen el bool terminado en true)
  let tick = 0;
  let fin = false;

  //--------------------------
  //6. Iniciar while mientras !Fin
  while (!fin) {
    // while (tick < 500) {
    //7. Iniciar isProcesoEnEjecucion, reorder, changePriority y changePriorityPID
    let isProcesoEnEjecucion = false; // Por si hay un proceso en ejecucion en el tick actual
    let reorder = false; // Por si hay que reordenar el array por llegada
    let changePriority = false; // Por si hay que mover un proceso al inicio del array
    let changePriorityPID = undefined; // PID del proceso a mover
    //8. Realizar un for para iterar arrayProcesos, por cada tick se iteran todos los procesos
    for (let i = 0; i < arrayProcesos.length; i++) {
      //Se revisa en cada iteracion si el proceso ya termino, de ser asi se usa un continue
      let proceso = arrayProcesos[i];
      if (proceso.terminado) {
        continue;
      }
      //9. Revisar si la longitud del array de estados del proceso es 0, o sea, no ha empezado
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
      //------------------------------------------------------------------------------------------------------------------------------
      //(Caso 'Bloqueo')
      if (ultimoEstado === "Bloqueo") {
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
      //------------------------------------------------------------------------------------------------------------------------------
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
    //10.revisar si isProcesoEnEjecucion termino siendo false, de ser asi sumar uno a cpu_desaprovechada

    if (!isProcesoEnEjecucion) {
      cpu_desaprovechada++;
    }
    //11. Si reorder es true, ordenar arrayProcesos por llegada
    if (reorder) {
      arrayProcesos = orderArrayProcesos(arrayProcesos);
    }
    //12. Si changePriority es true, mover el proceso con pid igual a changePriorityPID al inicio del arrayProcesos
    if (changePriority) {
      //buscar en arrayProcesos el proceso con pid igual a changePriorityPID y moverlo al inicio del array sin usar el array de procesos
      arrayProcesos.unshift(
        arrayProcesos.splice(
          arrayProcesos.findIndex(
            (proceso) => proceso.programa.pid === changePriorityPID
          ),
          1
        )[0]
      );
    }

    //13.Revisar si hay alguno de los procesos que no haya terminado, de ser asi se mantiene el booleano fin en false
    fin = !arrayProcesos.some((proceso) => !proceso.terminado);
    //14. Sumar uno al tick
    tick++;
  }
  orderArrayProcesos(arrayProcesos);
  //12. Retornar un objeto con los arrays de estados y labels y el contador de cpu_desaprovechada
  return {
    ejecution_data: ejecution_data,
    ocupado_data: ocupado_data,
    en_espera_data: en_espera_data,
    cpu_desaprovechada: cpu_desaprovechada,
    labels: labels,
    tick: tick,
    arrayProcesos,
  };
}

function orderArrayProcesos(arrayProcesos) {
  //Ordenar el arrayProcesos dejando de primeras los procesos que tienen menos ejecucion restante (proceso.programa.duracion - counterEjecucion)
  arrayProcesos.sort(
    (a, b) =>
      a.programa.duracion -
      a.counterEjecucion -
      (b.programa.duracion - b.counterEjecucion)
  );
  return arrayProcesos;
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
