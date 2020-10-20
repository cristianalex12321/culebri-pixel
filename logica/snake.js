
(function() {

    //variables globales
    var controller, display, game;
  //funcion de la inicializacion de los controladores para el movimiento del snake
   
    controller = {
  
      down:false, left:false, right:false, up:false,
  
     
      keyUpDown:function(event) {
  
        var key_state = (event.type == "keydown")?true:false;
  
        switch(event.keyCode) {
  
          case 37: controller.left = key_state; break; 
          case 38: controller.up = key_state; break; 
          case 39: controller.right = key_state; break; 
          case 40: controller.down = key_state; break; 
  
        }
  
      }
  
    };
  
    
    display = {
  
   
      buffer:document.createElement("canvas").getContext("2d"),

      context:document.querySelector("canvas").getContext("2d"),
      output:document.querySelector("p"),
  

      graphics: {
  
        0: {//cuadricula o tablero
  
          canvas:document.createElement("canvas"),
          draw:function() {
  
            var context = this.canvas.getContext("2d");
            this.canvas.height = this.canvas.width = game.world.tile_size;
  
            context.fillStyle = "#DAD6D6";
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            context.fillStyle = "#FFFFFF";
            context.fillRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
  
          }
  
        },
  
        1: {// snake
  
          canvas:document.createElement("canvas"),
          draw:function() {
  
            var context = this.canvas.getContext("2d");
            this.canvas.height = this.canvas.width = game.world.tile_size;
  
            context.fillStyle = "#EDF108";
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            context.fillStyle = "#28F108";
            context.fillRect(1, 1, game.world.tile_size - 2, game.world.tile_size - 2);
  
          }
  
        },
  
        2: {// apple
  
          canvas:document.createElement("canvas"),
          draw:function() {
  
            var context = this.canvas.getContext("2d");
            this.canvas.height = this.canvas.width = game.world.tile_size;
  
            context.fillStyle = "#FF2C06";
            context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            context.fillStyle = "#FF2C06";
            context.fillRect(1, 1, game.world.tile_size - 2, game.world.tile_size - 2);
            
          }
  
        },
  
      },
  
      
      background_tile:0,
      segment:1,
      apple:2,
  
      //creacion del objeto cambas o del mapa
      render:function() {
  
        for (let index = 0; index < game.world.map.length; index ++) {
  
         
          let graphic = this.graphics[game.world.map[index]].canvas;
  
          
          this.buffer.drawImage(graphic, 0, 0, graphic.width, graphic.height, (index % game.world.columns) * game.world.tile_size, Math.floor(index / game.world.columns) * game.world.tile_size, game.world.tile_size, game.world.tile_size);
  
        }
  //en esta parte imprimimos el string escore y le vamos sumando lo que la serpiente esta comiendo en este caso las manzanas
        let leading_zeros = "SCORE: ";
        for (let index = 4 - game.score.toString().length; index > 0; -- index) {
  
          leading_zeros += "0";
  
        }
        
        this.output.innerHTML = leading_zeros + game.score;
      
         
      
          
       //finilizacion del dibujado de nuestro mapa
        this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height);
  
      },
  
      /* inicializacion o carga de nuestros eventos */
      resize:function(event) {
  
        var client_height = document.documentElement.clientHeight;
  
        display.context.canvas.width = document.documentElement.clientWidth - 32;
  
        if (display.context.canvas.width > client_height - 64 || display.context.canvas.height > client_height - 64) {
  
          display.context.canvas.width = client_height - 64;
  
        }
  
        display.context.canvas.height = display.context.canvas.width;
  
        display.render();
  
        let elements = document.querySelectorAll(".hideable");
  
        for (let index = elements.length - 1; index > -1; -- index) {
  
          if (document.body.offsetHeight < document.body.scrollHeight) {
  
            elements[index].style.visibility = "hidden";
  
          } else {
  
            elements[index].style.visibility = "visible";
  
          }
  
        }
  
      }
  
    };
  
    /* aqui esta toda la logica de nuestro juego desde los puntos las manzanas y la carga de nuestra serpiente */
    game = {
  
     
      score:0,
  
     
      apple: {
  
        index:Math.floor(Math.random() * 400)
        
  
      },
  
      /* aqui inicializamos nuestro objeto culebrita */
      snake: {
  
        head_index:209,
        old_head_index:undefined,
        segment_indices:[209, 210],
        vector_x:0,
        vector_y:0
  
      },
  
      /* inicializacion de nuestro mapa */
      world:{
  
        columns:20,
        tile_size:10,
        map:new Array(400).fill(display.background_tile)// creacion de un nuevo array de 400 filas para la implementacion de nuestro objetos
  
      },
  
  //tiempo para la aculacion de velocidad
      accumulated_time:0,
      time_step:250,/* tiempo en que el juego se detiene */
  
      /* Reseto del juego cuando chocamos con una pared o con nuestro propio cuerpo */
      reset:function() {
         
       
        this.score =0;
  
        /* colocamos al gusano o snake en la pacision indicada de nuestro mapa */
        for (let index = this.snake.segment_indices.length - 1; index > -1; -- index) {
  
          this.world.map[this.snake.segment_indices[index]] = display.background_tile;
  
        }
  
        this.snake.segment_indices = [209, 210];
        this.snake.head_index = 209;
        this.snake.old_head_index = undefined;
        this.snake.vector_x = this.snake.vector_y = 0;
        this.world.map[game.apple.index] = display.apple;
        this.world.map[game.snake.segment_indices[0]] = display.segment;
        this.world.map[game.snake.segment_indices[1]] = display.segment;
  
        this.time_step = 250;
  
        this.loop();//tomamos el ciclo y realizamos o llamamos a la funcion render display
        display.render();
  
      },
  
      /* carga del juego indefinidamente */
      loop:function(time_stamp) {
  
        //controles para mover a nuestra serpiente en este caso utilizamos las flechas del teclado para el ouput
        if (controller.down) {
  
          game.snake.vector_x = 0;
          game.snake.vector_y = 1;
  
        } else if (controller.left) {
  
          game.snake.vector_x = -1;
          game.snake.vector_y = 0;
  
        } else if (controller.right) {
  
          game.snake.vector_x = 1;
          game.snake.vector_y = 0;
  
        } else if (controller.up) {
  
          game.snake.vector_x = 0;
          game.snake.vector_y = -1;
  
        }
  
        /* en caso de que el juego se recete todo los controlkadores buelven a cero */
        if (time_stamp >= game.accumulated_time + game.time_step) {
  
          game.accumulated_time = time_stamp;
  
          /* cada vez que la serpiente se mueva se ira actualizando */
          if (game.snake.vector_x != 0 || game.snake.vector_y != 0) {
  
            if (game.snake.head_index + game.snake.vector_y * game.world.columns + game.snake.vector_x == game.snake.old_head_index) {
  
              game.snake.vector_x = game.snake.vector_y = 0;
              window.requestAnimationFrame(game.loop);
              return;
  
            }
  
            //movimiento de la snike por todo el mapa
            let tail_index = game.snake.segment_indices.pop();// remeuve los indices de o rastros que deja el snike a la hora de moverse
            game.world.map[tail_index] = display.background_tile;
            game.snake.old_head_index = game.snake.head_index;
            game.snake.head_index += game.snake.vector_y * game.world.columns + game.snake.vector_x;
  
          //en caso que colicione todo los rastros y la utlima posicion que tuvo nuestro 
            if (game.world.map[game.snake.head_index] == display.segment
              || game.snake.head_index < 0// el mapa lo volvemos a cero sin ningun rasto
              || game.snake.head_index > game.world.map.length - 1// cancelamos los botones dentro del mapa movimientos de arriba y abajo
              || (game.snake.vector_x == -1 && game.snake.head_index % game.world.columns == game.world.columns - 1)// desabilitamos el mapa y las imagnes
              || (game.snake.vector_x == 1 && (game.snake.head_index % game.world.columns == 0))) {// cancelamos los movimientos de los botnes de izquierda derecha
  
              game.reset();
              return;
  
            }
  
          //volvemos a tomar el titulo del juego y tambien el del score
            game.world.map[game.snake.head_index] = display.segment;
     
            game.snake.segment_indices.unshift(game.snake.head_index);
  
            /* aumentamos la velocidad del snike y tambien la puentuacion dentro de la variable score*/
            if (game.snake.head_index == game.apple.index) {
  
              game.score ++;
              game.time_step = (game.time_step > 100)?game.time_step - 10:100;// incremento de velocidad
              // add another segment to the tail position
              game.snake.segment_indices.push(tail_index);
              game.world.map[tail_index] = display.segment;
              game.apple.index = Math.floor(Math.random() * game.world.map.length);// volvemos la funcio de la manzana a su estado original
             
              // colocamos a la serpiente al medio del mapa.
              if (game.snake.segment_indices.length == game.world.map.length - 1) {
  
                game.reset();
                return;
  
              }
  
              //removemos todos los rastros de las manzanas dentro del mapa.
              while(game.world.map[game.apple.index] != display.background_tile) {
  
                game.apple.index ++;
  
                //colocamos las manzanas de manera aleatoria en el mapa
                if (game.apple.index > game.world.map.length - 1) {
  
                  game.apple.index = 0;
  
                }
  
              }
  
              // acemos un ciclo de la posicion de las manzanas en los distintos puntos del mapa
              game.world.map[game.apple.index] = display.apple;
  
            }
  
            display.render();
  
          }
  
        }
  
        // corremos los objetos dentro de la ventana.
        window.requestAnimationFrame(game.loop);
  
      }
  
    };
  
    // incializacion del juego:
  
    display.buffer.canvas.height = display.buffer.canvas.width = game.world.columns * game.world.tile_size;
  
    // dibujamos los graficos.
    for(let object in display.graphics) {
  
      display.graphics[object].draw();
  
    };
   
    
    //inicializamos los eventos
    window.addEventListener("resize", display.resize);
    window.addEventListener("keydown", controller.keyUpDown);
    window.addEventListener("keyup", controller.keyUpDown);
   
    game.reset();
    display.resize();
  
  })();
  