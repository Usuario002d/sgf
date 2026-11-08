import React from 'react'
import { Button } from 'semantic-ui-react';

export default function Child({ parentToChild, childToParent }) {
    const data = "This is data from Child Component to the Parent Component."
    return (
        <>
            <div>
                <Button primary onClick={() => childToParent(data)}>Click Child</Button>
            </div>

            <div>
                {parentToChild}
            </div>
        </>
    )
}