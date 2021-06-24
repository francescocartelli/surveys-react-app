import { useEffect, useState } from 'react'
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap'
import { ExclamationCircleFill, CheckCircleFill, ArrowUpCircleFill, TrashFill, ArrowDownCircleFill } from 'react-bootstrap-icons'
import './style.css'

/* Question's subcomponent containing title and other stuff */
function QuestionHeader(props) {
    // props.hint show or hides the error or correct icon
    return (
        <Row className="question-row">
            <div className="number-box">{props.number}</div>
            <Col><p className="pt-2 mb-0">{props.text}</p></Col>
            {props.hint && <Col xs="auto" className="pr-3 pt-2"> {
                props.error ?
                    <ExclamationCircleFill size="24" color="orange" /> :
                    <CheckCircleFill size="24" color="green" />
            }
            </Col>
            }
        </Row>
    )
}

/* Question used in SurveyEditor as a question preview */
function EditQuestion(props) {
    const moveUp = () => {
        props.setQuestions(prevQuestions => {
            return prevQuestions.map((q, i) => {
                if (i === props.position - 1) return prevQuestions[props.position]
                else if (i === props.position) return prevQuestions[props.position - 1]
                else return q
            })
        })
    }

    const moveDown = () => {
        props.setQuestions(prevQuestions => {
            return prevQuestions.map((q, i) => {
                if (i === props.position) return prevQuestions[props.position + 1]
                else if (i === props.position + 1) return prevQuestions[props.position]
                else return q
            })
        })
    }

    return (
        <Container fluid className="question-container">
            <Row className="question-row">
                <div className="number-box">{props.number + 1}</div>
                <Col><p className="pt-2 mb-0">{props.question.text}</p></Col>
                {
                    props.position !== 0 &&
                    <Col xs="auto" className="pl-1 pr-0">
                        <Button onClick={() => { moveUp() }}>
                            <ArrowUpCircleFill />
                        </Button>
                    </Col>
                }
                {
                    !props.isLast &&
                    <Col xs="auto" className="pl-1 pr-0">
                        <Button onClick={() => { moveDown() }}>
                            <ArrowDownCircleFill />
                        </Button>
                    </Col>
                }
                <Col xs="auto" className="pl-1 pr-0">
                    <Button variant="danger" onClick={() => props.removeQuestion()}><TrashFill /></Button>
                </Col>
            </Row>
            <Row>
                {props.question.type === 0 ?
                    <InputGroup>
                        {props.question.answers.map((answer, i) => {
                            return <Col sm="12" md="6" key={props.question.id + "ans" + i} className="pb-1">
                                <Row key={"qt_" + i} className="answer-row">
                                    <Col xs="auto">{
                                        props.max === 1 ?
                                            <Form.Check readOnly /> : <InputGroup.Radio readOnly />
                                    }</Col>
                                    <Col xs="auto" className="pl-3 pr-0"><div className="number-box-answer">{i + 1}.</div></Col>
                                    <Col>{answer.text}</Col>
                                </Row>
                            </Col>
                        })}
                    </InputGroup> :
                    <Col xs="12" className="pt-1">
                        <Form.Control readOnly as="textarea" rows={3} placeholder="Short text answer here..." />
                    </Col>
                }
            </Row>
        </Container>
    )
}

/* Closed question component used in SurveyForm by the user  */
function ClosedQuestion(props) {
    // This useState contains the ids of the checked answers
    // when this change the state is sent into the survey userAnswers state
    const [checked, setChecked] = useState([])
    // Is used only for max answers overloading
    const [message, setMessage] = useState("")

    /* Handle form multiple choice */
    const updateUserAnswers = (answerId, ev) => {
        const value = ev.target.checked
        let newMessage = ""
        if (value === true) {
            // If true max answers will be overloaded, stop action, do not change state
            if (Number(checked.length) >= Number(props.question.max)) {
                // Check if user will raise the max answers limit
                ev.preventDefault()
                newMessage += "Maximum number of answers reached. Deselect some if you want to change answers."
                setMessage(newMessage)
            } else setChecked(p => [...p, answerId])
        } else {
            setMessage("")
            setChecked(p => p.filter(item => item !== answerId))
        }
    }

    /* Handle for single choice */
    const updateUserAnswersRadio = (answerId, ev) => {
        if (ev.target.checked) setChecked(p => [answerId])
    }

    // This is a callback that aligns the value of this answered question
    // to the survey form userAnswers useEffect
    const updateParent = props.setUserAnswers
    useEffect(() => {
        updateParent(prev => {
            return prev.map(userAnswer => {
                return userAnswer.id === props.question.id ?
                    { id: props.question.id, type: props.question.type, values: checked } : userAnswer
            })
        })
    }, [checked, updateParent, props.question.id, props.question.type])

    return (
        <Container fluid className="question-container">
            <QuestionHeader
                number={props.number + 1}
                text={props.question.text}
                error={checked.length < props.question.min}
                hint={true}></QuestionHeader>
            {
                (props.question.min !== 0 || props.question.max !== 1) &&
                <Row className="suggestion-text-small">
                    {props.question.min !== 0 && <Col xs="auto" className="pr-0">Minumun of {props.question.min} answers required.</Col>}
                    {props.question.min !== 1 && <Col xs="auto">Maximum of {props.question.max} answers allowed.</Col>}
                </Row>
            }
            {
                message &&
                <Row className="suggestion-text-small"><Col xs="12">{message}</Col></Row>
            }
            <Row>
                <InputGroup>
                    {
                        (props.question.min === 1 && props.question.max === 1) ?
                            props.question.answers.map((answer, i) => {
                                return <Answers
                                    key={"ans_" + answer.id}
                                    answer={answer}
                                    number={i}
                                    controlType="radio"
                                    isChecked={checked.includes(answer.id)}
                                    updateUserAnswers={updateUserAnswersRadio}
                                ></Answers>
                            }) : props.question.answers.map((answer, i) => {
                                return <Answers
                                    key={"ans_" + answer.id}
                                    answer={answer}
                                    number={i}
                                    controlType="check"
                                    isChecked={checked.indexOf(answer.id) > -1}
                                    updateUserAnswers={updateUserAnswers}
                                ></Answers>
                            })
                    }
                </InputGroup>
            </Row>
        </Container >
    )
}

/* Open question component used in SurveyForm by the user  */
function OpenQuestion(props) {
    const [value, setValue] = useState("")

    // This is a callback that aligns the value of this answered question
    // to the survey form userAnswers useEffect
    const updateParent = props.setUserAnswers
    useEffect(() => {
        updateParent(prev => {
            return prev.map(userAnswer => {
                return userAnswer.id === props.question.id ?
                    { id: props.question.id, type: props.question.type, values: value } : userAnswer
            })
        })
    }, [value, updateParent, props.question.id, props.question.type])

    return (
        <Container fluid className="question-container">
            <QuestionHeader
                number={props.number + 1}
                text={props.question.text}
                error={props.question.min !== 0 && value === ""}
                hint={true}></QuestionHeader>
            {
                props.question.min > 0 && <Row className="suggestion-text-small">
                    <Col xs="auto" className="pr-0">This answer is necessary</Col>
                </Row>
            }
            <Row>
                <Col xs="12" className="pt-1">
                    <Form.Control as="textarea"
                        rows={3}
                        maxLength="200"
                        value={value}
                        placeholder="Short text answer here..."
                        onChange={ev => setValue(ev.target.value)} />
                </Col>
            </Row>
        </Container >
    )
}

/* Block of answers used in ClosedQuestion */
function Answers(props) {
    const handleChange = (ev) => {
        ev.preventDefault()
        props.updateUserAnswers(props.answer.id, ev)
    }
    return (
        <Col sm="12" md="6" className="pb-1">
            <Row className="answer-row">
                <Col xs="auto">{
                    props.controlType === 'check' ?
                        <Form.Check
                            checked={props.isChecked}
                            onChange={ev => { handleChange(ev) }} /> :
                        <InputGroup.Radio
                            name={"group_" + props.questionId}
                            onChange={ev => { handleChange(ev) }}
                        />
                }</Col>
                <Col xs="auto" className="pl-3 pr-0"><div className="number-box-answer">{props.number + 1}.</div></Col>
                <Col>{props.answer.text}</Col>
            </Row>
        </Col>
    )
}

export { ClosedQuestion, OpenQuestion, EditQuestion }