using Microsoft.AspNetCore.Mvc;
using Megagram.Data;
using Microsoft.EntityFrameworkCore;
using Megagram.Models;
namespace Megagram.Models.RequestBodies;




[ApiController]
[Route("/")]
public class BackendController : ControllerBase
{

    private readonly MegaDbContext _megaDbContext;

    public BackendController(MegaDbContext megaDbContext)
    {
        _megaDbContext = megaDbContext;
    }


    [HttpGet("getAllConvos")]
    public async Task<IActionResult> getAllConvos()
    {
        var convos = await _megaDbContext.convos.ToListAsync();
        return Ok(convos);
    }

    [HttpGet("getAllMessages")]
    public async Task<IActionResult> getAllMessages()
    {
        var messages = await _megaDbContext.messages.ToListAsync();
        return Ok(messages);
    }

    [HttpGet("getAllMessageReactions")]
    public async Task<IActionResult> getAllMessageReactions()
    {
        var messageReactions = await _megaDbContext.messageReactions.ToListAsync();
        return Ok(messageReactions);
    }

    [HttpPost("addConvo")]
    public IActionResult addNewConvo([FromBody] Convo newConvo) {
        if (newConvo == null) {
            return BadRequest("Invalid conversation data.");
        }

        _megaDbContext.Add(newConvo);
        _megaDbContext.SaveChanges();

        return Ok(newConvo);
    }

    [HttpPost("addMessage")]
    public IActionResult addNewMessage([FromBody] Message newMessage) {
        if (newMessage == null) {
            return BadRequest("Invalid message data.");
        }

        _megaDbContext.Add(newMessage);
        _megaDbContext.SaveChanges();

        return Ok(newMessage);
    }

    [HttpPost("addMessageReaction")]
    public IActionResult addNewMessageReaction([FromBody] MessageReaction newMessageReaction) {
        if (newMessageReaction == null) {
            return BadRequest("Invalid message-reaction data.");
        }

        _megaDbContext.Add(newMessageReaction);
        _megaDbContext.SaveChanges();

        return Ok(newMessageReaction);
    }

    [HttpDelete("deleteConvo/{convoId}")]
    public async Task<IActionResult> deleteConvo (string convoId)
    {
        if (!Guid.TryParse(convoId, out Guid parsedConvoId))
        {
            return BadRequest(false);
        }

        var convo = await _megaDbContext.convos
        .FirstOrDefaultAsync(cl => cl.convoId == parsedConvoId);

        if (convo != null)
        {
            _megaDbContext.convos.Remove(convo);
            
            var messages = await _megaDbContext.messages
            .Where(cl => cl.convoId == convoId)
            .ToListAsync();

            foreach (var message in messages)
            {
                _megaDbContext.messages.Remove(message);
            }

            await _megaDbContext.SaveChangesAsync();


            return Ok(true);
        }

        return NotFound(false);
    }

    [HttpDelete("deleteMessage/{messageId}")]
    public async Task<IActionResult> deleteMessage (string messageId)
    {
        if (!Guid.TryParse(messageId, out Guid parsedMessageId))
        {
            return BadRequest(false);
        }

        var message = await _megaDbContext.messages
        .FirstOrDefaultAsync(cl => cl.messageId == parsedMessageId);

        if (message != null)
        {
            _megaDbContext.messages.Remove(message);
            await _megaDbContext.SaveChangesAsync();
            return Ok(true);
        }

        return NotFound(false);
    }

    [HttpDelete("deleteMessageReaction/{messageId}/{username}/{reaction}")]
    public async Task<IActionResult> deleteMessageReaction (string messageId, string username, string reaction)
    {

        var messageReaction = await _megaDbContext.messageReactions
        .FirstOrDefaultAsync(cl => cl.messageId == messageId && cl.username == username && cl.reaction == reaction);

        if (messageReaction != null)
        {
            _megaDbContext.messageReactions.Remove(messageReaction);
            await _megaDbContext.SaveChangesAsync();
            return Ok(true);
        }

        return NotFound(false);
    }

    [HttpPatch("editConvo/{convoId}")]
    public async Task<IActionResult> editConvo (string convoId, [FromBody] ConvoEditRequestBody editedConvo)
    {
        if (!Guid.TryParse(convoId, out Guid parsedConvoId))
        {
            return BadRequest(false);
        }

        var convo = await _megaDbContext.convos
        .FirstOrDefaultAsync(cl => cl.convoId == parsedConvoId);

        if (convo != null)
        {
            convo.convoTitle = editedConvo.convoTitle;
            convo.members = editedConvo.members;
            convo.convoInitiator = editedConvo.convoInitiator;
            convo.latestMessage = editedConvo.latestMessage;
            convo.promotedUsers = editedConvo.promotedUsers;
            convo.isMuted = editedConvo.isMuted;
            convo.hasUnreadMessage = editedConvo.hasUnreadMessage;
            convo.isRequested = editedConvo.isRequested;
            convo.isDeleted = editedConvo.isDeleted;

            _megaDbContext.convos.Update(convo);
            await _megaDbContext.SaveChangesAsync();
            return Ok(true);
        }

        return NotFound(false);

    }

    [HttpPatch("editMessage/{messageId}")]
    public async Task<IActionResult> editMessage (string messageId, [FromBody] MessageEditRequestBody editedMessage)
    {
        if (!Guid.TryParse(messageId, out Guid parsedMessageId))
        {
        return BadRequest(false);
        }

        var message = await _megaDbContext.messages
        .FirstOrDefaultAsync(cl => cl.messageId == parsedMessageId);

        if (message != null)
        {
            message.message = editedMessage.message;
            _megaDbContext.messages.Update(message);
            await _megaDbContext.SaveChangesAsync();
            return Ok(true);
        }

        return NotFound(false);
    }


    [HttpGet("getAllConvos/{username}")]
    public async Task<IActionResult> getAllConvosOfUsername(string username)
    {
        var convos = await _megaDbContext.convos
            .Where(cl => cl.members.Contains(username))
            .ToListAsync();

        return Ok(convos);
    }

    [HttpGet("getMessage/{messageId}")]
    public async Task<IActionResult> getMessage(string messageId)
    {
        if (!Guid.TryParse(messageId, out Guid parsedMessageId))
        {
        return BadRequest(false);
        }

        var message = await _megaDbContext.messages
            .FirstOrDefaultAsync(cl => cl.messageId == parsedMessageId);

        if(message!=null) {
            return Ok(message);
        }

        return NotFound();

    }


    [HttpGet("getMessagesForConvo/{convoId}")]
    public async Task<IActionResult> getMessagesForConvo(string convoId)
    {
        var messages = await _megaDbContext.messages
        .Where(cl => cl.convoId == convoId)
        .OrderBy(cl => cl.messageSentAt)
        .ToListAsync();


        return Ok(messages);
    }

    [HttpDelete("deleteMessageReactionsOfMessage/{messageId}")]
    public async Task<IActionResult> deleteMessageReactionsOfMessage (string messageId)
    {

        var messageReactions = await _megaDbContext.messageReactions
        .Where(cl => cl.messageId==messageId)
        .ToListAsync();

    
        foreach (var messageReaction in messageReactions)
        {
            _megaDbContext.messageReactions.Remove(messageReaction);
        }

        await _megaDbContext.SaveChangesAsync();

        return Ok(true);

    }






}
