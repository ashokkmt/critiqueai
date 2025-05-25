import { FaRegLightbulb, FaRobot } from 'react-icons/fa';
import '../styles/OutputBox.css';

export default function OutputBox({ Loading }) {
    return (
        <div className='output-box'>

            {

                Loading ? <div className='output-placeholder'>
                    <FaRobot size={40} color="#3fe493" />
                    <p>AI is ready to generate your result...</p>
                    <div className="shimmer-line"></div>
                    <div className="shimmer-line short"></div>
                </div>
                    :
                    <>
                        <h3>Output</h3>
                        <div className='line'></div>
                        <div className='sub-out-box'>
                            <div className='empty-state'>
                                <FaRegLightbulb size={42} color="#3fe493" />
                                <h4>Your answer will appear here</h4>
                                <p>Start by submitting your response to see AI feedback and suggestions.</p>
                            </div>
                        </div>
                    </>
            }
        </div>
    );
}
