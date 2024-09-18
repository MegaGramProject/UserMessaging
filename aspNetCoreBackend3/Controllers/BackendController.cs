using Microsoft.AspNetCore.Mvc;
using Megagram.Services;
using Megagram.Models;


namespace Megagram.Controllers;


[ApiController]
[Route("/")]
public class BackendController : ControllerBase
{
    private readonly MegaDBService _megaDBService;

    public BackendController(MegaDBService megaDBService)
    {
        _megaDBService = megaDBService;
    }

    [HttpGet("getAllCurrentlyActiveSessionKeys")]
    public async Task<IActionResult> getAllCurrentlyActiveSessionKeys()
    {
        var getAllCurrentlyActiveSessionKeys = await _megaDBService.listAllCurrentlyActiveSessionKeys();
        return Ok(getAllCurrentlyActiveSessionKeys);
    }

    [HttpPost("addActiveSessionKey")]
    public async Task<IActionResult> addCurrentlyActiveSessionKey([FromBody] CurrentlyActiveSessionKey newKey)
    {
        _megaDBService.addCurrentlyActiveSessionKey(newKey);
        return Ok(true);
    }

    [HttpPost("getCurrentlyActiveSessionKeysForSpecifiedConvoIds")]
    public async Task<IActionResult> getCurrentlyActiveSessionKeysForSpecifiedConvoIds([FromBody] string[] convoIds)
    {
        var currentlyActiveSessionKeysForSpecifiedConvoIds = await _megaDBService.listCurrentlyActiveSessionKeysBasedOnConvoIds(convoIds);
        return Ok(currentlyActiveSessionKeysForSpecifiedConvoIds);
    }


}