import { useState } from 'react';
import Child from './Child';

function Parent() {
    const [data, setData] = useState('');

    const parentToChild = () => {
        setData("This is data from Parent Component to the Child Component.");
    }

    const childToParent = (childdata) => {
        setData(childdata);
    }

    return (
        <div>
            <div>
                <Child childToParent={childToParent} />
            </div>

            <div>
                <Child parentToChild={data} />
                <Button primary onClick={() => parentToChild()}>Click Parent</Button>
            </div>
        </div>
    );
}

export default Parent;