import React from 'react'
import { useState } from 'react'

const Cambio = () => {
   /* Moedas de entrada no sistema  */
    const[valor, setValor]=useState("")
    const [taxaDeConversao, setTaxaDeConversao] = useState("")

    /* Moeda inicial ou que deve ser convertida no sistema  */
    const[deMoeda, setDeMoeda]=useState("CNY")
    /* Moeda final ou convertida no sistema  */
    const[paraMoeda, setParaMoeda]=useState("USD")
    /*Função de resultado de conversão de moedas  */
    const[resultado, setResultado]=useState("0")
   
   /* Função de conversão de moedas  */
    const converter = ( ) => {
        setResultado (valor*taxaDeConversao)
    }


  return (
    <>
      <div style={{textAlign: 'center'}}>
        <div><h3>Conversor de moedas</h3></div>
        <div>
            <label>Valor:</label> 
            <input type='number'required placeholder='Digitar valor aqui.' value={valor} onChange={(e) => setValor(e.target.value)}></input>
        </div>
        <div>
          <label>Taxa:</label>
          <input type='number' required placeholder='Digitar taxa aqui.' value={taxaDeConversao} onChange={(e) => setTaxaDeConversao(e.target.value)}></input> 
        </div>
        <div>
            <label>De:</label>
            <select value={deMoeda} onChange={e => setDeMoeda (e.target.value)}>
            <option value="CNY">China</option>
            <option value="USD">Dolar</option>
            <option value="EUR">Euro</option>
            <option value="ZAR">Rand</option>
            <option value="MZN">Metical</option>
        </select>
        </div>

        <div>
            <label>Para:</label>
            <select value={paraMoeda} onChange={e => setParaMoeda(e.target.value)}>
            <option value="CNY">China</option>
            <option value="USD">Dolar</option>
            <option value="EUR">Euro</option>
            <option value="ZAR">Rand</option>
            <option value="MZN">Metical</option>
        </select>
        </div>
        
        <div>
             <button onClick={converter}>Converter</button>
        </div>
       
        <div>Resultado</div>{resultado}
      </div>
    </>
  )
}
export default Cambio
