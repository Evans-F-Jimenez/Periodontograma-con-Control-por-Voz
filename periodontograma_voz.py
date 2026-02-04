"""
Sistema de Periodontograma con Control por Voz
Permite registrar mediciones periodontales mediante comandos de voz
"""
import os
import speech_recognition as sr
import re
import json
from typing import Dict, Optional
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from datetime import date
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


class Periodontograma:
    """Clase para manejar el periodontograma dental"""
    
    def __init__(self):
        # Estructura de dientes: 32 dientes permanentes
        # Cuadrantes: 1(superior derecho), 2(superior izquierdo), 
        #             3(inferior izquierdo), 4(inferior derecho)
        self.dientes = {
            # Superior derecho (18-11)
            18: self._crear_diente(), 17: self._crear_diente(), 16: self._crear_diente(),
            15: self._crear_diente(), 14: self._crear_diente(), 13: self._crear_diente(),
            12: self._crear_diente(), 11: self._crear_diente(),
            # Superior izquierdo (21-28)
            21: self._crear_diente(), 22: self._crear_diente(), 23: self._crear_diente(),
            24: self._crear_diente(), 25: self._crear_diente(), 26: self._crear_diente(),
            27: self._crear_diente(), 28: self._crear_diente(),
            # Inferior izquierdo (31-38)
            38: self._crear_diente(), 37: self._crear_diente(), 36: self._crear_diente(),
            35: self._crear_diente(), 34: self._crear_diente(), 33: self._crear_diente(),
            32: self._crear_diente(), 31: self._crear_diente(),
            # Inferior derecho (41-48)
            41: self._crear_diente(), 42: self._crear_diente(), 43: self._crear_diente(),
            44: self._crear_diente(), 45: self._crear_diente(), 46: self._crear_diente(),
            47: self._crear_diente(), 48: self._crear_diente(),
        }
        
    def _crear_diente(self) -> Dict:
        return {
            # Estado general del diente
            'ausente': False,
            'implante': False,
            'movilidad': 0,

            # Caras
            'vestibular': {
                'furca': 0,
                'sangrado': [False, False, False],     # M-C-D
                'placa': [False, False, False],
                'anchura_encia': 0,                    # mm (valor único)
                'margen_gingival': [0, 0, 0],
                'profundidad_sondaje': [0, 0, 0]
            },

            'palatino': {
                'furca': 0,
                'sangrado': [False, False, False],
                'placa': [False, False, False],
                'anchura_encia': 0,
                'margen_gingival': [0, 0, 0],
                'profundidad_sondaje': [0, 0, 0]
            }
        }
    
    def marcar_ausente(self, diente: int):
        """Marca un diente como ausente"""
        if diente in self.dientes:
            self.dientes[diente]['ausente'] = True
            print(f"✓ Diente {diente} marcado como ausente")
            return True
        return False
    
    def marcar_implante(self, diente: int):
        """Marca un diente como implante"""
        if diente in self.dientes:
            self.dientes[diente]['implante'] = True
            print(f"✓ Diente {diente} marcado como implante")
            return True
        return False

    def registrar_profundidad(self, diente: int, cara: str, posicion: int, valor: int):
        """Registra profundidad de sondaje"""
        if diente in self.dientes and cara in ['vestibular', 'palatino', 'lingual']:
            cara_real = 'palatino' if cara == 'lingual' else cara
            if 0 <= posicion < 3:
                self.dientes[diente][cara_real]['profundidad_sondaje'][posicion] = valor
                print(f"✓ Diente {diente}, {cara}, posición {posicion+1}: {valor}mm")
                return True
        return False
    
    def registrar_movilidad(self, diente: int, grado: int):
        """Registra movilidad dental (0-3)"""
        if diente in self.dientes and 0 <= grado <= 3:
            self.dientes[diente]['movilidad'] = grado
            print(f"✓ Diente {diente}, movilidad: grado {grado}")
            return True
        return False
    
    def registrar_furca(self, diente: int, cara: str,grado: int):
        """Registra afectación de furca (0-3)"""
        if diente in self.dientes and not self.dientes[diente]['ausente']:
            cara_real = 'palatino' if cara == 'lingual' else cara
            if diente in self.dientes and 0 <= grado <= 3:
                self.dientes[diente][cara_real]['furca'] = grado
                print(f"✓ Diente {diente}, furca: grado {grado}")
                return True
        return False
    
    def registrar_sangrado(self, diente: int, cara: str, posicion: int):
        """Registra sangrado al sondaje"""
        if diente in self.dientes and not self.dientes[diente]['ausente']:
            cara_real = 'palatino' if cara == 'lingual' else cara
            if 0 <= posicion < 3:
                self.dientes[diente][cara_real]['sangrado'][posicion] = True
                print(f"✓ Diente {diente}, {cara}, posición {posicion+1}: sangrado")
                return True
        return False
    
    def registrar_placa(self, diente: int, cara: str, posicion: int):
        """Registra placa bacteriana"""
        if diente in self.dientes and not self.dientes[diente]['ausente'] and not self.dientes[diente]['implante']:
            cara_real = 'palatino' if cara == 'lingual' else cara
            if 0 <= posicion < 3:
                self.dientes[diente][cara_real]['placa'][posicion] = True
                print(f"✓ Diente {diente}, {cara}, posición {posicion+1}: placa")
                return True
        return False
    
    def registrar_margen_gingival(self, diente: int, cara: str, posicion: int, valor: int):
        """Registra margen gingival (+/- mm)"""
        if diente in self.dientes and not self.dientes[diente]['ausente']:
            cara_real = 'palatino' if cara == 'lingual' else cara
            if 0 <= posicion < 3:
                self.dientes[diente][cara_real]['margen_gingival'][posicion] = valor
                print(f"✓ Diente {diente}, {cara}, posición {posicion+1}: MG {valor}mm")
                return True
        return False

    def registrar_anchura_encia(self, diente: int, cara:str, valor: int):
        """Registra anchura de encía queratinizada (mm, valor único)"""
        if diente in self.dientes and not self.dientes[diente]['ausente'] and valor >= 0:
            cara_real = 'palatino' if cara == 'lingual' else cara
            self.dientes[diente][cara_real]['anchura_encia'] = valor
            print(f"✓ Diente {diente}: AEQ {valor}mm")
            return True
        return False
    
    def exportar_json(self, nombre_archivo: str = None):
        """Exporta el periodontograma a JSON"""
        if nombre_archivo is None:
            carpeta = BASE_DIR / "Data" 
            carpeta.mkdir(parents=True, exist_ok=True)

            timestamp = date.today()
            nombre_archivo = f"periodontograma_{timestamp}.json"
            ruta_completa = carpeta / nombre_archivo

            with open(ruta_completa, 'w', encoding='utf-8') as f:
                json.dump(self.dientes, f, indent=2, ensure_ascii=False)

            print(f"✓ Periodontograma exportado a {nombre_archivo}")
        return nombre_archivo
    
    def visualizar(self, carpeta: str = "Temp_Informacion"):
        """Crea una visualización básica del periodontograma"""
        fig, ax = plt.subplots(figsize=(16, 10))
        
        # Configurar el gráfico
        ax.set_xlim(0, 18)
        ax.set_ylim(0, 12)
        ax.axis('off')
        ax.set_title('Periodontograma', fontsize=16, fontweight='bold')
        
        # Dibujar arcada superior
        y_superior = 8
        self._dibujar_arcada(ax, [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28], 
                            y_superior, "Superior")
        
        # Dibujar arcada inferior
        y_inferior = 2
        self._dibujar_arcada(ax, [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38], 
                            y_inferior, "Inferior")
        
        plt.tight_layout()
        timestamp = date.today()
        nombre_archivo = f"periodontograma_{timestamp}.png"

        os.makedirs(carpeta, exist_ok=True)
        ruta_completa = os.path.join(carpeta, nombre_archivo)

        plt.savefig(ruta_completa, dpi=150, bbox_inches='tight')
        print(f"✓ Visualización guardada en {nombre_archivo}")
        plt.close()
        return nombre_archivo
    
    def _dibujar_arcada(self, ax, dientes_orden, y_base, titulo):
        """Dibuja una arcada dental"""
        x_start = 1
        ancho_diente = 0.9
        
        for i, num_diente in enumerate(dientes_orden):
            x = x_start + i
            diente = self.dientes[num_diente]
            
            # Dibujar rectángulo del diente
            if diente['ausente']:
                color = 'lightgray'
            else:
                color = 'white'
            
            rect = patches.Rectangle((x, y_base), ancho_diente, 1.5, 
                                     linewidth=1, edgecolor='black', 
                                     facecolor=color)
            ax.add_patch(rect)
            
            # Número del diente
            ax.text(x + ancho_diente/2, y_base + 0.75, str(num_diente), 
                   ha='center', va='center', fontsize=8, fontweight='bold')
            
            # Valores vestibular (arriba del diente)
            if not diente['ausente']:
                vest = diente['vestibular']
                for j, val in enumerate(vest):
                    if int(val) > 0:
                        color_txt = 'red' if val >= 4 else 'black'
                        ax.text(x + (j+1)*ancho_diente/4, y_base + 1.7, 
                               str(val), ha='center', va='bottom', 
                               fontsize=7, color=color_txt)
                
                # Valores palatino (abajo del diente)
                pal = diente['palatino']
                for j, val in enumerate(pal):
                    if int(val) > 0:
                        color_txt = 'red' if val >= 4 else 'black'
                        ax.text(x + (j+1)*ancho_diente/4, y_base - 0.2, 
                               str(val), ha='center', va='top', 
                               fontsize=7, color=color_txt)
                
                # Movilidad
                if diente['movilidad'] > 0:
                    ax.text(x + ancho_diente/2, y_base - 0.5, 
                           f"M{diente['movilidad']}", ha='center', 
                           fontsize=6, color='blue')

class ReconocimientoVoz:
    """Clase para manejar el reconocimiento de voz"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        
    def escuchar(self) -> Optional[str]:
        """Escucha y convierte voz a texto"""
        with sr.Microphone() as source:
            print("\n🎤 Escuchando... (habla ahora)")
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            
            try:
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                print("⏳ Procesando...")
                
                # Intentar reconocer en español
                texto = self.recognizer.recognize_google(audio, language='es-ES')
                print(f"📝 Reconocido: '{texto}'")
                return texto.lower()
                
            except sr.WaitTimeoutError:
                print("⚠️  No se detectó voz")
                return None
            except sr.UnknownValueError:
                print("⚠️  No se pudo entender el audio")
                return None
            except sr.RequestError as e:
                print(f"❌ Error en el servicio de reconocimiento: {e}")
                return None
            except Exception as e:
                print(f"❌ Error inesperado: {e}")
                return None

class ProcesadorComandos:
    """Procesa comandos de voz para el periodontograma"""
    
    def __init__(self, periodontograma: Periodontograma):
        self.perio = periodontograma
        
    def procesar(self, texto: str) -> bool:
        """Procesa un comando de voz"""
        if not texto:
            return False
        
        #Caras
        caras = { "vestibular": ["vestibular", "bucal", "vesti"], 
                 "palatino": ["palatino", "palatina", "pala"], 
                 "lingual": ["lingual", "lingu"] }

        # Normalizar texto
        texto = texto.lower().strip()
        
        # Comando: salir
        if any(palabra in texto for palabra in ['salir', 'terminar', 'finalizar', 'cerrar']):
            return 'SALIR'
        
        # Comando: exportar
        if 'exportar' in texto:
            self.perio.exportar_json()
            return True
        
        # Comando: visualizar
        if 'visualizar' in texto or 'mostrar' in texto or 'gráfico' in texto:
            self.perio.visualizar()
            return True
        
        # Comando: registrar profundidad
        # Formato: "diente 16 vestibular mesial 3"
        # Formato alternativo: "16 vestibular 3 2 4" (tres valores)
        
        # Intentar extraer número de diente
        match_diente = re.search(r'diente\s+(\d+)|^(\d+)\s+', texto)
        if match_diente:
            num_diente = int(match_diente.group(1) or match_diente.group(2))
            
            # Verificar si es ausente
            if 'ausente' in texto or 'falta' in texto or 'perdido' in texto:
                return self.perio.marcar_ausente(num_diente)
            # Verificar si es implante
            if 'implante' in texto or 'repuesto' in texto or 'falso' in texto:
                return self.perio.marcar_implante(num_diente)
            
            # Extraer cara (vestibular/palatino/lingual)
            #if 'vestibular' in texto or 'bucal' in texto or 'vesti' in texto:
            #        cara = 'vestibular'
            #elif 'palatino' in texto or 'palatina' in texto or 'pala' in texto:
            #        cara = 'palatino'
            #elif 'lingual' in texto or 'lingu' in texto:
            #        cara = 'lingual'
            cara = None
            for nombre_cara, palabras in caras.items(): 
                if any(p in texto for p in palabras): 
                    cara = nombre_cara 
                    break   
            
            if cara:
                # Buscar tres valores consecutivos
                numeros = re.findall(r'\d+', texto)
                valores = [int(n) for n in numeros if int(n) <= 15 and int(n) != num_diente]
                
                if len(valores) >= 3:
                    # Registrar los tres valores (mesial, centro, distal)
                    success = True
                    for i in range(3):
                        if not self.perio.registrar_profundidad(num_diente, cara, i, valores[i]):
                            success = False
                    return success
                else:
                    # Buscar posición específica
                    posicion = None
                    if 'mesial' in texto:
                        posicion = 0
                    elif 'centro' in texto or 'central' in texto or 'medio' in texto:
                        posicion = 1
                    elif 'distal' in texto:
                        posicion = 2
                    
                    if posicion is not None and len(valores) >= 1:
                        return self.perio.registrar_profundidad(num_diente, cara, posicion, valores[0])
            
            # Movilidad
            if 'movilidad' in texto:
                numeros = re.findall(r'\d+', texto)
                grados = [int(n) for n in numeros if int(n) <= 3 and int(n) != num_diente]
                if grados:
                    return self.perio.registrar_movilidad(num_diente, grados[0])
            
            # Furca
            if 'furca' in texto or 'furcación' in texto:
                numeros = re.findall(r'\d+', texto)
                grados = [int(n) for n in numeros if int(n) <= 3 and int(n) != num_diente]
                if grados:
                    return self.perio.registrar_furca(num_diente,cara, grados[0])
        
             # Sangrado o placa
            if 'sangrado' in texto or 'placa' in texto:
                tipo = 'sangrado' if 'sangrado' in texto else 'placa'

                # Posición específica
                posicion = None
                if 'mesial' in texto:
                    posicion = 0
                elif 'centro' in texto or 'central' in texto or 'medio' in texto:
                    posicion = 1
                elif 'distal' in texto:
                    posicion = 2
        

                # Si se dice solo "sangrado" o "placa" → marcar las 3
                if posicion is None:
                    for i in range(3):
                        if tipo == 'sangrado':
                            self.perio.registrar_sangrado(num_diente, cara, i)
                        else:
                            self.perio.registrar_placa(num_diente, cara, i)
                    return True

                # Posición individual
                if tipo == 'sangrado':
                    return self.perio.registrar_sangrado(num_diente, cara, posicion)
                else:
                    return self.perio.registrar_placa(num_diente, cara, posicion)

                # === MARGEN GINGIVAL ===
            
            if 'margen' in texto or 'gingival' in texto:
                numeros = list(map(int, re.findall(r'-?\d+', texto)))
                numeros = numeros[1:]  # eliminar diente

                # Posición específica
                posicion = None
                if 'mesial' in texto:
                        posicion = 0
                elif 'centro' in texto or 'central' in texto or 'medio' in texto:
                        posicion = 1
                elif 'distal' in texto:
                        posicion = 2

                if posicion is not None and numeros:
                    return self.perio.registrar_margen_gingival(num_diente, cara, posicion, numeros[0])

                # Tres valores
                if len(numeros) >= 3:
                    for i in range(3):
                        self.perio.registrar_margen_gingival(num_diente, cara, i, numeros[i])
                    return True

            # === ANCHURA DE ENCÍA QUERATINIZADA ===
            if 'encía' in texto or 'encia' in texto:
                numeros = list(map(int, re.findall(r'\d+', texto)))
                numeros = numeros[1:]  # eliminar número del diente

                if numeros:
                    return self.perio.registrar_anchura_encia(num_diente,cara, numeros[0])

        print("⚠️  Comando no reconocido. Intenta de nuevo.")
        return False

def mostrar_ayuda():
    """Muestra la ayuda de comandos"""
    print("\n" + "="*60)
    print("COMANDOS DE VOZ DISPONIBLES")
    print("="*60)
    print("\n📋 REGISTRAR PROFUNDIDADES:")
    print("  • 'diente 16 vestibular 3 2 4' - Registra 3 valores (M-C-D)")
    print("  • 'diente 21 palatino mesial 5' - Registra un valor específico")
    print("  • '16 vestibular 2 3 2' - Formato corto con 3 valores")
    print("\n🦷 OTROS REGISTROS:")
    print("  • 'diente 18 movilidad 2' - Registra movilidad (0-3)")
    print("  • 'diente 16 furca 1' - Registra afectación de furca (0-3)")
    print("  • 'diente 28 ausente' - Marca diente como ausente")
    print("\n💾 GESTIÓN:")
    print("  • 'exportar' o 'guardar' - Guarda en formato JSON")
    print("  • 'visualizar' o 'mostrar gráfico' - Genera imagen")
    print("  • 'ayuda' - Muestra esta ayuda")
    print("  • 'salir' o 'terminar' - Finaliza el programa")
    print("\n" + "="*60)

def main():
    """Función principal"""
    print("="*60)
    print("  SISTEMA DE PERIODONTOGRAMA CON CONTROL POR VOZ")
    print("="*60)
    
    # Inicializar componentes
    perio = Periodontograma()
    voz = ReconocimientoVoz()
    procesador = ProcesadorComandos(perio)
    
    # mostrar_ayuda()
    
    print("\n✅ Sistema iniciado. Di 'ayuda' para ver los comandos.")
    print("   Presiona Ctrl+C para salir en cualquier momento.\n")
    
    try:
        while True:
            # Escuchar comando
            comando = voz.escuchar()
            
            if comando:
                # Mostrar ayuda
                if 'ayuda' in comando:
                    mostrar_ayuda()
                    continue
                
                # Procesar comando
                resultado = procesador.procesar(comando)
                
                if resultado == 'SALIR':
                    print("\n¿Deseas guardar antes de salir? (di 'guardar' o 'no guardar')")
                    respuesta = voz.escuchar()
                    if respuesta and 'guardar' in respuesta:
                        perio.exportar_json()
                        perio.visualizar()
                    break
            
            # Pequeña pausa entre comandos
            import time
            time.sleep(0.5)
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Programa interrumpido por el usuario")
        print("Guardando datos...")
        perio.exportar_json()
        perio.visualizar()
    
    print("\n✅ Programa finalizado. ¡Hasta pronto!")

if __name__ == "__main__":
    main()
