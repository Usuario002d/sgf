import React from 'react';
import BudgetBarCharts from './BudgetBarCharts';
import ExecutionBudgetDataCharts from './ExecutionBudgetDataCharts';
import BarCharts from './FinanceBarCharts';
import Analyze from './Analyze';



const DashboardAlt4 = () => {
    return (
        <div>
            <div>
                <BudgetBarCharts></BudgetBarCharts>
            </div>
            <div>
                <ExecutionBudgetDataCharts></ExecutionBudgetDataCharts>
            </div>
            <div>
                <h4 style={{ textAlign: "center", color: "#000000" }}><strong>FLUXOS FINANCEIROS</strong></h4>
                <BarCharts />
            </div>
            <div>
                <h4 style={{ textAlign: "center", color: "#000000" }}><strong>ANÁLISE FINANCEIRA</strong></h4>
                <Analyze></Analyze>
            </div>
        </div>
    )
}
export default DashboardAlt4